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
} from "@/lib/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { convertToWebP } from "@/lib/convert-image";
import { uploadToR2 } from "@/lib/providers";
import slugify from "slugify";
import { auth, errorRes, successRes } from "@/lib/auth";
import { z } from "zod";
import { and, asc, countDistinct, desc, eq, inArray, sql } from "drizzle-orm";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { r2Public } from "@/config";
import { generateRandomNumber } from "@/lib/utils";

const productSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  indication: z.string().min(1, { message: "Indication is required." }),
  dosageUsage: z.string().min(1, { message: "Dosage & usage is required." }),
  storageInstruction: z
    .string()
    .min(1, { message: "Storage instruction is required." }),
  packaging: z.string().min(1, { message: "Packaging is required." }),
  registrationNumber: z
    .string()
    .min(1, { message: "Registration number is required." }),
  isActive: z.coerce.boolean(),
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
      basicPrice: z.string(),
      petShopPrice: z.string(),
      doctorPrice: z.string(),
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
        basicPrice: z.string(),
        petShopPrice: z.string(),
        doctorPrice: z.string(),
        weight: z.string(),
      })
    )
    .optional(),
});

const sortField = (s: string) => {
  if (s === "name") return products.name;
  if (s === "stock")
    return sql`(
      SELECT COALESCE(SUM(${productVariants.stock}), 0)
      FROM ${productVariants}
      WHERE ${productVariants.productId} = ${products.id}
    )`;
  if (s === "status") return products.status;
  if (s === "categoryName") return categories.name;
  if (s === "supplierName") return suppliers.name;
  if (s === "petCount") return sql`COUNT(DISTINCT ${pets.id})`;
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

    const filters = [];
    if (categoryIds.length)
      filters.push(inArray(products.categoryId, categoryIds));
    if (supplierIds.length)
      filters.push(inArray(products.supplierId, supplierIds));
    if (status === "true") filters.push(eq(products.status, true));
    else if (status === "false") filters.push(eq(products.status, false));

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
      [products.name, products.slug],
      req,
      finalWhere,
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
           ORDER BY ${productImages.createdAt} ASC 
           LIMIT 1)`.as("image"),
        categoryName: categories.name,
        supplierName: suppliers.name,
        stock: sql`
          (SELECT COALESCE(SUM(${productVariants.stock}), 0) 
           FROM ${productVariants} 
           WHERE ${productVariants.productId} = ${products.id})`.as("stock"),
        variantCount: countDistinct(productVariants.id).as("variantCount"),
        petCount: countDistinct(pets.id).as("petCount"),
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
      .leftJoin(productToPets, eq(products.id, productToPets.productId))
      .leftJoin(pets, eq(productToPets.petId, pets.id))
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .where(where)
      .groupBy(products.id, categories.name, suppliers.name)
      .orderBy(order === "desc" ? desc(sortField(sort)) : asc(sortField(sort)))
      .limit(limit)
      .offset(offset);

    const formatted = results.map((item) => ({
      ...item,
      image: item.image ? `${r2Public}/${item.image as string}` : null,
    }));

    const supplierOptions = await db
      .selectDistinct({ id: suppliers.id, name: suppliers.name })
      .from(products)
      .innerJoin(suppliers, eq(products.supplierId, suppliers.id));

    const categoryOptions = await db
      .selectDistinct({ id: categories.id, name: categories.name })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id));

    const petOptions = await db
      .selectDistinct({ id: pets.id, name: pets.name })
      .from(productToPets)
      .innerJoin(pets, eq(productToPets.petId, pets.id));

    return successRes(
      {
        data: formatted,
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
      const key = `images/products/${createId()}-${slugify(title, { lower: true })}.webp`;
      await uploadToR2({ buffer, key });
      uploadedKeys.push(key);
    }

    const productId = createId();
    const titleFormatted = `${title}-${generateRandomNumber(5)}`;
    const slug = slugify(titleFormatted, { lower: true });

    // Jalankan semua operasi dalam satu transaksi
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

      // Insert images
      if (uploadedKeys.length) {
        await tx.insert(productImages).values(
          uploadedKeys.map((url) => ({
            id: createId(),
            productId,
            url,
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

      // Insert variants
      if (variants && variants.length > 0) {
        await tx.insert(productVariants).values(
          variants.map((v) => ({
            id: createId(),
            productId,
            name: v.name,
            sku: v.sku,
            barcode: v.barcode,
            normalPrice: v.normalPrice,
            basicPrice: v.basicPrice,
            petShopPrice: v.petShopPrice,
            doctorPrice: v.doctorPrice,
            stock: v.stock,
            weight: v.weight,
            isDefault: false,
          }))
        );
      } else if (defaultVariant) {
        await tx.insert(productVariants).values({
          id: createId(),
          productId,
          name: defaultVariant.name,
          sku: defaultVariant.sku,
          barcode: defaultVariant.barcode,
          normalPrice: defaultVariant.normalPrice,
          basicPrice: defaultVariant.basicPrice,
          petShopPrice: defaultVariant.petShopPrice,
          doctorPrice: defaultVariant.doctorPrice,
          stock: defaultVariant.stock,
          weight: defaultVariant.weight,
          isDefault: true,
        });
      }
    });

    return successRes({ id: productId }, "Product created", 201);
  } catch (err) {
    console.error(err);
    return errorRes("Failed to create product", 500);
  }
}
