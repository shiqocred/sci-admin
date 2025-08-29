import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  products,
  productImages,
  productVariants,
  productCompositions,
  productToPets,
  categories,
  suppliers,
  pets,
  productAvailableRoles,
  productVariantPrices,
} from "@/lib/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { convertToWebP } from "@/lib/convert-image";
import { uploadToR2 } from "@/lib/providers";
import slugify from "slugify";
import { auth, errorRes, successRes } from "@/lib/auth";
import { z } from "zod";
import {
  and,
  asc,
  desc,
  eq,
  inArray,
  InferSelectModel,
  isNull,
  sql,
} from "drizzle-orm";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { r2Public } from "@/config";
import { generateRandomNumber } from "@/lib/utils";

type Variant = {
  sku: string;
  stock: string;
  name: string;
};

type ProductGrouped = {
  id: string;
  name: string;
  slug: string;
  status: boolean;
  image: string | null;
  variants: Variant[] | null;
  default_variant: Variant | null;
  available: string[]; // sekarang di level product
};

const productSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  indication: z.string().optional(),
  dosageUsage: z.string().optional(),
  storageInstruction: z.string().optional(),
  packaging: z.string().optional(),
  registrationNumber: z.string().optional(),
  isActive: z.coerce.boolean(),
  available: z
    .array(z.enum(["BASIC", "PETSHOP", "VETERINARIAN"]))
    .min(1, { message: "Available role is required" }),
  categoryId: z.string().min(1, { message: "Category is required." }),
  supplierId: z.string().min(1, { message: "Supplier is required." }),
  petIds: z
    .array(z.string().min(1, { message: "Pet is required." }))
    .min(1, { message: "Pet is required." }),
  compositions: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, { message: "Composition name is required." }),
        value: z.string().min(1, { message: "Composition value is required." }),
      })
    )
    .min(1, { message: "Compositions is required." }),
  defaultVariant: z
    .object({
      id: z.string().optional(),
      name: z.string(),
      sku: z.string().min(1, { message: "SKU is required." }),
      barcode: z.string().min(1, { message: "Barcode is required." }),
      stock: z.string(),
      normalPrice: z.string(),
      basicPrice: z.string().nullish(),
      petShopPrice: z.string().nullish(),
      doctorPrice: z.string().nullish(),
      weight: z.string(),
    })
    .optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, { message: "Variant name is required." }),
        sku: z.string().min(1, { message: "Variant SKU is required." }),
        barcode: z.string().min(1, { message: "Variant barcode is required." }),
        stock: z.string(),
        normalPrice: z.string(),
        basicPrice: z.string().nullish(),
        petShopPrice: z.string().nullish(),
        doctorPrice: z.string().nullish(),
        weight: z.string(),
      })
    )
    .optional(),
});

type RoleType = InferSelectModel<typeof productAvailableRoles>["role"];

function transformData(rows: any[]): ProductGrouped[] {
  const grouped = Object.values(
    rows.reduce(
      (acc, row) => {
        if (!acc[row.id]) {
          acc[row.id] = {
            id: row.id,
            name: row.name,
            slug: row.slug,
            status: row.status,
            image: row.image,
            variants: [],
            default_variant: null,
            available: [],
          } as ProductGrouped;
        }

        // Merge array available dan hapus duplikat
        acc[row.id].available = Array.from(
          new Set([...(acc[row.id].available || []), ...(row.available || [])])
        );

        const variant: Variant = {
          sku: row.variantSku,
          stock: row.variantStock,
          name: row.variantName,
        };

        if (row.variantDefault) {
          if (!acc[row.id].default_variant) {
            acc[row.id].default_variant = variant;
          }
        } else {
          const exists = acc[row.id].variants!.some(
            (v: any) => v.sku === variant.sku && v.name === variant.name
          );
          if (!exists) {
            acc[row.id].variants!.push(variant);
          }
        }

        return acc;
      },
      {} as Record<string, ProductGrouped>
    )
  );

  return grouped.map((p: any) => ({
    ...p,
    variants: p.variants && p.variants.length > 0 ? p.variants : null,
  }));
}

const sortField = (s: string) => {
  if (s === "name") return products.name;
  if (s === "stock")
    return sql`(
      SELECT COALESCE(SUM(${productVariants.stock}), 0)
      FROM ${productVariants}
      WHERE ${productVariants.productId} = ${products.id}
    )`;
  if (s === "status") return products.status;
  return products.createdAt; // default
};

export async function GET(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") ?? "";
    const sort = req.nextUrl.searchParams.get("sort") ?? "created";
    const order = req.nextUrl.searchParams.get("order") ?? "desc";

    const categoryIds = req.nextUrl.searchParams
      .getAll("categoryId")
      .filter(Boolean);
    const supplierIds = req.nextUrl.searchParams
      .getAll("supplierId")
      .filter(Boolean);
    const petIds = req.nextUrl.searchParams.getAll("petId").filter(Boolean);
    const status = req.nextUrl.searchParams.get("status");

    const filters = [isNull(products.deletedAt)];
    if (categoryIds.length)
      filters.push(inArray(products.categoryId, categoryIds));
    if (supplierIds.length)
      filters.push(inArray(products.supplierId, supplierIds));
    if (status === "true") {
      filters.push(eq(products.status, true));
    } else if (status === "false") {
      filters.push(eq(products.status, false));
    }

    const baseWhere = filters.length ? and(...filters) : undefined;
    const petFilter = petIds.length
      ? inArray(productToPets.petId, petIds)
      : undefined;

    const finalWhere = petFilter
      ? baseWhere
        ? and(baseWhere, petFilter)
        : petFilter
      : baseWhere;

    const { where, offset, limit, pagination } = await getTotalAndPagination(
      products,
      q,
      [products.name, products.slug, productVariants.sku],
      req,
      finalWhere,
      true,
      true
    );

    const results = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        status: products.status,
        image: sql`
      (SELECT ${productImages.url} 
       FROM ${productImages} 
       WHERE ${productImages.productId} = ${products.id} 
       ORDER BY ${Number(productImages.position)} ASC 
       LIMIT 1)`.as("image"),
        variantSku: productVariants.sku,
        variantStock: productVariants.stock,
        variantName: productVariants.name,
        variantDefault: productVariants.isDefault,
        available:
          sql`COALESCE(json_agg(DISTINCT ${productAvailableRoles.role}), '[]')`.as(
            "available"
          ),
      })
      .from(products)
      .leftJoin(
        productAvailableRoles,
        eq(productAvailableRoles.productId, products.id)
      )
      .leftJoin(productToPets, eq(productToPets.productId, products.id))
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .where(where)
      .groupBy(
        products.id,
        productVariants.sku,
        productVariants.stock,
        productVariants.name,
        productVariants.isDefault
      )
      .orderBy(order === "desc" ? desc(sortField(sort)) : asc(sortField(sort)))
      .limit(limit)
      .offset(offset);

    const formatted = results.map((item) => ({
      ...item,
      image: item.image ? `${r2Public}/${item.image as string}` : null,
    }));

    const [supplierOptions, categoryOptions, petOptions] = await Promise.all([
      db
        .selectDistinct({ id: suppliers.id, name: suppliers.name })
        .from(products)
        .innerJoin(suppliers, eq(products.supplierId, suppliers.id)),
      db
        .selectDistinct({ id: categories.id, name: categories.name })
        .from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id)),
      db
        .selectDistinct({ id: pets.id, name: pets.name })
        .from(productToPets)
        .innerJoin(pets, eq(productToPets.petId, pets.id)),
    ]);

    return successRes(
      {
        data: transformData(formatted),
        selectOptions: {
          suppliers: supplierOptions,
          categories: categoryOptions,
          pets: petOptions,
        },
        pagination,
      },
      "Product list"
    );
  } catch (error) {
    console.error("ERROR_GET_PRODUCTS", error);
    return errorRes("Internal Server Error", 500);
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const rawDefaultVariant = formData.get("defaultVariant");
    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      indication: formData.get("indication"),
      dosageUsage: formData.get("dosageUsage"),
      storageInstruction: formData.get("storageInstruction"),
      packaging: formData.get("packaging"),
      registrationNumber: formData.get("registrationNumber"),
      isActive: formData.get("isActive") === "true",
      categoryId: formData.get("categoryId"),
      supplierId: formData.get("supplierId"),
      available: JSON.parse((formData.get("available") as string) || "[]"),
      petIds: JSON.parse((formData.get("petId") as string) || "[]"),
      compositions: JSON.parse(
        (formData.get("compositions") as string) || "[]"
      ),
      defaultVariant: rawDefaultVariant
        ? JSON.parse(rawDefaultVariant as string)
        : undefined,
      variants: JSON.parse((formData.get("variants") as string) || "[]"),
    };

    const parsed = productSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return errorRes("Validation failed", 400, errors);
    }

    const {
      title,
      description,
      indication,
      dosageUsage,
      storageInstruction,
      packaging,
      registrationNumber,
      isActive,
      available,
      categoryId,
      supplierId,
      petIds,
      compositions,
      defaultVariant,
      variants,
    } = parsed.data;

    const images = formData.getAll("image") as File[];
    const uploadedKeys: string[] = [];

    // Upload images
    for (const image of images) {
      const buffer = await convertToWebP(image);
      const key = `images/products/${slugify(title, { lower: true })}/${createId()}.webp`;
      await uploadToR2({ buffer, key });
      uploadedKeys.push(key);
    }

    const productId = createId();
    const titleFormatted = `${title}-${generateRandomNumber(5)}`;
    const slug = slugify(titleFormatted, { lower: true });

    await db.transaction(async (tx) => {
      // Insert product
      await tx.insert(products).values({
        id: productId,
        name: title,
        slug,
        description,
        indication,
        dosageUsage,
        storageInstruction,
        packaging,
        registrationNumber,
        status: isActive,
        categoryId,
        supplierId,
      });

      // Insert available roles
      if (available?.length) {
        await tx.insert(productAvailableRoles).values(
          available.map((role) => ({
            productId,
            role,
          }))
        );
      }

      // Insert images
      if (uploadedKeys.length) {
        await tx.insert(productImages).values(
          uploadedKeys.map((url, idx) => ({
            productId,
            url,
            position: (idx + 1).toString(),
          }))
        );
      }

      // Insert pet relations
      if (petIds?.length) {
        await tx.insert(productToPets).values(
          petIds.map((petId) => ({
            productId,
            petId,
          }))
        );
      }

      // Insert compositions
      if (compositions?.length) {
        await tx.insert(productCompositions).values(
          compositions.map((c) => ({
            id: createId(),
            productId,
            name: c.name,
            value: c.value,
          }))
        );
      }

      // Insert variants + variant prices
      const insertVariantWithPrices = async (
        variant: any,
        isDefault: boolean
      ) => {
        const variantId = createId();

        // Insert variant
        await tx.insert(productVariants).values({
          id: variantId,
          productId,
          name: variant.name,
          sku: variant.sku,
          barcode: variant.barcode,
          price: variant.normalPrice, // optional: simpan normal price sebagai default price
          stock: variant.stock,
          weight: variant.weight,
          isDefault,
        });

        // Insert variant prices per role
        const rolePriceMap = [
          { role: "BASIC" as RoleType, price: variant.basicPrice },
          { role: "PETSHOP" as RoleType, price: variant.petShopPrice },
          { role: "VETERINARIAN" as RoleType, price: variant.doctorPrice },
        ].filter((rp) => rp.price !== undefined && rp.price !== null);

        if (rolePriceMap.length) {
          await tx.insert(productVariantPrices).values(
            rolePriceMap.map((rp) => ({
              variantId,
              role: rp.role,
              price: rp.price,
            }))
          );
        }
      };

      if (variants && variants.length > 0) {
        for (const v of variants) {
          await insertVariantWithPrices(v, false);
        }
      } else if (defaultVariant) {
        await insertVariantWithPrices(defaultVariant, true);
      }
    });

    return successRes({ id: productId }, "Product created", 201);
  } catch (err) {
    console.error(err);
    return errorRes("Failed to create product", 500);
  }
}
