import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { convertToWebP } from "@/lib/convert-image";
import {
  categories,
  db,
  pets,
  productAvailableRoles,
  productCompositions,
  productImages,
  products,
  productToPets,
  productVariantPrices,
  productVariants,
  suppliers,
} from "@/lib/db";
import { deleteR2, uploadToR2 } from "@/lib/providers";
import { generateRandomNumber } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";
import {
  and,
  eq,
  inArray,
  InferSelectModel,
  notInArray,
  sql,
} from "drizzle-orm";
import { NextRequest } from "next/server";
import slugify from "slugify";
import { z } from "zod/v4";

type RoleType = InferSelectModel<typeof productAvailableRoles>["role"];

interface ProductData {
  title: string;
  description?: string;
  indication?: string;
  dosageUsage?: string;
  storageInstruction?: string;
  packaging?: string;
  registrationNumber?: string;
  isActive: boolean;
  categoryId?: string;
  supplierId?: string;
  petIds?: string[];
  compositions?: CompositionData[];
  defaultVariant?: VariantData;
  variants?: VariantData[];
  available: string[];
}

interface CompositionData {
  id: string;
  name: string;
  value: string;
}

interface VariantData {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  stock: string;
  normalPrice: string;
  basicPrice?: string | null;
  petShopPrice?: string | null;
  doctorPrice?: string | null;
  weight: string;
}

interface ExistingImageData {
  id: string;
  url: string;
}

interface ExistingPetData {
  petId: string;
}

interface ExistingVariantData {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  normalPrice: string;
  basicPrice: string | null;
  petShopPrice: string | null;
  doctorPrice: string | null;
  stock: string | null;
  weight: string | null;
  isDefault: boolean | null;
}

const roleKeyMap: Record<string, keyof VariantData> = {
  BASIC: "basicPrice",
  PETSHOP: "petShopPrice",
  VETERINARIAN: "doctorPrice",
  ADMIN: "normalPrice", // misal untuk admin
};

const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  indication: z.string().optional(),
  dosageUsage: z.string().optional(),
  storageInstruction: z.string().optional(),
  packaging: z.string().optional(),
  registrationNumber: z.string().optional(),
  isActive: z.coerce.boolean(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  petIds: z.array(z.string()).optional(),
  available: z
    .array(z.enum(["BASIC", "PETSHOP", "VETERINARIAN"]))
    .min(1, { message: "Available role is required" }),
  compositions: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  defaultVariant: z
    .object({
      id: z.string(),
      name: z.string(),
      sku: z.string(),
      barcode: z.string().optional(),
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
        id: z.string(),
        name: z.string(),
        sku: z.string(),
        barcode: z.string().optional(),
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { productId } = await params;

    const [product] = await db
      .select({
        id: products.id,
        title: products.name,
        description: products.description,
        indication: products.indication,
        dosageUsage: products.dosageUsage,
        storageInstruction: products.storageInstruction,
        packaging: products.packaging,
        registrationNumber: products.registrationNumber,
        status: products.status,
        categoryId: categories.id,
        categoryName: categories.name,
        supplierId: suppliers.id,
        supplierName: suppliers.name,
      })
      .from(products)
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .leftJoin(suppliers, eq(suppliers.id, products.supplierId))
      .where(eq(products.id, productId))
      .limit(1);

    const productFormated = {
      ...product,
      category: {
        id: product.categoryId,
        name: product.categoryName,
      },
      supplier: {
        id: product.supplierId,
        name: product.supplierName,
      },
    };

    delete (productFormated as any).categoryId;
    delete (productFormated as any).categoryName;
    delete (productFormated as any).supplierId;
    delete (productFormated as any).supplierName;

    const images = await db.query.productImages.findMany({
      columns: {
        url: true,
      },
      where: (i, { eq }) => eq(i.productId, productId),
    });

    const petsRow = await db
      .select({
        id: pets.id,
        name: pets.name,
      })
      .from(productToPets)
      .leftJoin(pets, eq(pets.id, productToPets.petId))
      .where(eq(productToPets.productId, productId));

    const compositions = await db.query.productCompositions.findMany({
      columns: {
        id: true,
        name: true,
        value: true,
      },
      where: (c, { eq }) => eq(c.productId, productId),
    });

    const variants = await db
      .select({
        id: productVariants.id,
        name: productVariants.name,
        isDefault: productVariants.isDefault,
        price: productVariants.price,
        sku: productVariants.sku,
        barcode: productVariants.barcode,
        stock: productVariants.stock,
        weight: productVariants.weight,
      })
      .from(productVariants)
      .where(eq(productVariants.productId, productId));

    const variantIds = variants.map((i) => i.id);

    const availableRole = await db.query.productAvailableRoles.findMany({
      columns: {
        role: true,
      },
      where: (ar, { eq }) => eq(ar.productId, productId),
    });
    const pricings = await db.query.productVariantPrices.findMany({
      where: (ar, { inArray }) => inArray(ar.variantId, variantIds),
    });

    const variantFormatted = variants.map((variant) => ({
      ...variant,
      pricing: pricings
        .filter((p) => p.variantId === variant.id)
        .map(({ variantId, ...rest }) => rest), // buang variantId
    }));

    const response = {
      ...productFormated,
      images: images.map((item) => `${r2Public}/${item.url}`),
      pets: petsRow,
      compositions,
      variants: variantFormatted,
      available: availableRole.map((i) => i.role),
    };

    return successRes(response, "Detail Product");
  } catch (error) {
    console.log("ERROR_DETAIL_PRODUCT:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { productId } = await params;

    const existProduct = await db.query.products.findFirst({
      columns: {
        id: true,
      },
      where: (p, { eq }) => eq(p.id, productId),
    });

    if (!existProduct) return errorRes("Product not found", 404);

    const iamgeList = await db.query.productImages.findMany({
      columns: {
        url: true,
      },
      where: (p, { eq }) => eq(p.productId, productId),
    });

    await db.delete(products).where(eq(products.id, productId));

    if (iamgeList.length > 0) {
      for (const image of iamgeList) {
        await deleteR2(image.url);
      }
    }

    return successRes(null, "Product successfully deleted");
  } catch (error) {
    console.log("ERROR_DELETE_PRODUCT:", error);
    return errorRes("Internal Error", 500);
  }
}

const imageHandle = async (
  formData: FormData,
  productId: string,
  title: string
) => {
  const imagesExist: ExistingImageData[] =
    await db.query.productImages.findMany({
      columns: { id: true, url: true },
      where: (i, { eq }) => eq(i.productId, productId),
    });

  const images = formData.getAll("image") as File[];
  const imageOld = formData.getAll("imageOld") as string[];
  const imageOldFormatted = imageOld.map((url) =>
    url.replace(`${r2Public}/`, "")
  );

  const removedImages = imagesExist.filter(
    (item) => !imageOldFormatted.includes(item.url)
  );
  const removedImageId = removedImages.map((item) => item.id);
  const removedImageKey = removedImages.map((item) => item.url);

  removedImageKey.forEach((key) => deleteR2(key));

  const uploadPromises = images.map(async (image) => {
    const buffer = await convertToWebP(image);
    const key = `images/products/${createId()}-${slugify(title, {
      lower: true,
    })}.webp`;
    await uploadToR2({ buffer, key });
    return key;
  });

  const uploadedKeys = await Promise.all(uploadPromises);

  return { removedImageId, uploadedKeys };
};

const petHandle = async (tx: any, productId: string, petIds: string[]) => {
  const petsExist: ExistingPetData[] = await tx.query.productToPets.findMany({
    columns: { petId: true },
    where: (p: any, { eq }: any) => eq(p.productId, productId),
  });

  const existingPetIds = petsExist.map((e) => e.petId);
  const addedPetIds = petIds.filter((id) => !existingPetIds.includes(id));
  const removedPetIds = existingPetIds.filter((id) => !petIds.includes(id));

  if (removedPetIds.length > 0) {
    await tx
      .delete(productToPets)
      .where(inArray(productToPets.petId, removedPetIds));
  }
  if (addedPetIds.length > 0) {
    await tx
      .insert(productToPets)
      .values(addedPetIds.map((petId) => ({ productId, petId })));
  }
};

const compositionHandle = async (
  tx: any,
  productId: string,
  compositions: CompositionData[]
) => {
  const compositionExist = await tx.query.productCompositions.findMany({
    columns: { id: true, name: true, value: true },
    where: (c: any, { eq }: any) => eq(c.productId, productId),
  });

  const oldIds = new Set(compositionExist.map((c: any) => c.id));
  const newIds = new Set(compositions.map((c) => c.id));

  const added = compositions.filter((c) => !oldIds.has(c.id));
  const deleted = compositionExist.filter((c: any) => !newIds.has(c.id));
  const updated = compositions.filter((c) => {
    const oldItem = compositionExist.find((o: any) => o.id === c.id);
    return oldItem && (oldItem.name !== c.name || oldItem.value !== c.value);
  });

  if (added.length > 0) {
    await tx
      .insert(productCompositions)
      .values(added.map((c) => ({ ...c, productId })));
  }
  if (deleted.length > 0) {
    await tx.delete(productCompositions).where(
      inArray(
        productCompositions.id,
        deleted.map((c: any) => c.id)
      )
    );
  }
  if (updated.length > 0) {
    await Promise.all(
      updated.map((c) =>
        tx
          .update(productCompositions)
          .set({ name: c.name, value: c.value, updatedAt: sql`NOW()` })
          .where(eq(productCompositions.id, c.id))
      )
    );
  }
};

const handleIsVariant = async (
  tx: any,
  variantExist: ExistingVariantData[],
  variants: VariantData[],
  productId: string,
  availableRoles: RoleType[],
  isDefaultVariant = false
) => {
  const oldIds = new Set(variantExist.map((v) => v.id));
  const newIds = new Set(variants.map((v) => v.id));

  const added = variants.filter((v) => !oldIds.has(v.id));
  const deleted = variantExist.filter((v) => !newIds.has(v.id));
  const updated = variants.filter((v) => {
    const old = variantExist.find((o) => o.id === v.id);
    return (
      old &&
      (old.name !== v.name ||
        old.sku !== v.sku ||
        old.barcode !== (v.barcode ?? null) ||
        old.weight !== (v.weight ?? null) ||
        old.stock !== (v.stock ?? null))
    );
  });

  // ------------------- Insert new variants -------------------
  const addedIdMap: Record<string, string> = {}; // mapping old dummy ID → new DB ID
  for (const v of added) {
    const newId = createId();
    addedIdMap[v.id] = newId;

    await tx.insert(productVariants).values({
      id: newId,
      productId,
      name: v.name,
      sku: v.sku,
      barcode: v.barcode,
      weight: v.weight,
      stock: v.stock,
      price: v.normalPrice,
      isDefault: isDefaultVariant,
    });
    v.id = newId; // update ID di payload supaya bisa dipakai untuk pricing
  }

  // ------------------- Delete removed variants -------------------
  if (deleted.length > 0) {
    const deletedIds = deleted.map((v) => v.id);
    await tx
      .delete(productVariants)
      .where(inArray(productVariants.id, deletedIds));
    // hapus harga terkait
    await tx
      .delete(productVariantPrices)
      .where(inArray(productVariantPrices.variantId, deletedIds));
  }

  // ------------------- Update existing variants -------------------
  for (const v of updated) {
    await tx
      .update(productVariants)
      .set({
        name: v.name,
        sku: v.sku,
        barcode: v.barcode,
        weight: v.weight,
        stock: v.stock,
        price: v.normalPrice,
        updatedAt: sql`NOW()`,
      })
      .where(eq(productVariants.id, v.id));
  }

  // ------------------- Update variant pricing -------------------
  for (const v of variants) {
    // Hapus harga role yang sudah tidak ada di availableRoles
    await tx
      .delete(productVariantPrices)
      .where(
        and(
          eq(productVariantPrices.variantId, v.id),
          notInArray(productVariantPrices.role, availableRoles)
        )
      );

    // Masukkan/update harga sesuai availableRoles
    for (const role of availableRoles) {
      const key = roleKeyMap[role];
      const price = v[key] ?? 0;

      const exists = await tx.query.productVariantPrices.findFirst({
        where: (p: any, { eq, and }: any) =>
          and(eq(p.variantId, v.id), eq(p.role, role)),
      });

      if (exists) {
        await tx
          .update(productVariantPrices)
          .set({ price })
          .where(
            and(
              eq(productVariantPrices.variantId, v.id),
              eq(productVariantPrices.role, role)
            )
          );
      } else {
        await tx.insert(productVariantPrices).values({
          variantId: v.id,
          role,
          price,
        });
      }
    }
  }
};

const handleVariants = async (
  tx: any,
  variants: VariantData[] | undefined,
  defaultVariant: VariantData | undefined,
  productId: string,
  availableRoles: RoleType[]
) => {
  const variantExist = await tx.query.productVariants.findMany({
    columns: {
      id: true,
      name: true,
      sku: true,
      barcode: true,
      weight: true,
      stock: true,
      isDefault: true,
    },
    where: (v: any, { eq }: any) => eq(v.productId, productId),
  });

  if (variants && variants.length > 0) {
    await handleIsVariant(
      tx,
      variantExist,
      variants,
      productId,
      availableRoles,
      false
    );
  } else if (defaultVariant) {
    await handleIsVariant(
      tx,
      variantExist,
      [defaultVariant],
      productId,
      availableRoles,
      true
    );
  }
};

// ---------------------- PUT Function ----------------------

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const formData = await req.formData();
    const { productId } = await params;

    const rawDefaultVariant = formData.get("defaultVariant");
    const payload: any = {
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
        errors[err.path.join(".")] = err.message;
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
      available,
    }: ProductData = parsed.data;

    const productExist = await db.query.products.findFirst({
      columns: { id: true, name: true, slug: true },
      where: (p, { eq }) => eq(p.id, productId),
    });
    if (!productExist) return errorRes("Product not found", 404);

    const slug =
      productExist.name === title
        ? productExist.slug
        : slugify(`${title}-${generateRandomNumber(5)}`, { lower: true });

    await db.transaction(async (tx) => {
      // Update product main info
      await tx
        .update(products)
        .set({
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
          updatedAt: sql`NOW()`,
        })
        .where(eq(products.id, productId));

      // Handle images
      const { uploadedKeys, removedImageId } = await imageHandle(
        formData,
        productId,
        title
      );
      if (removedImageId.length > 0)
        await tx
          .delete(productImages)
          .where(inArray(productImages.id, removedImageId));
      if (uploadedKeys.length > 0)
        await tx
          .insert(productImages)
          .values(
            uploadedKeys.map((url) => ({ id: createId(), productId, url }))
          );

      // Handle pets
      if (petIds?.length) await petHandle(tx, productId, petIds);
      else
        await tx
          .delete(productToPets)
          .where(eq(productToPets.productId, productId));

      // Handle compositions
      if (compositions?.length)
        await compositionHandle(tx, productId, compositions);
      else
        await tx
          .delete(productCompositions)
          .where(eq(productCompositions.productId, productId));

      // Handle available roles
      await tx
        .delete(productAvailableRoles)
        .where(eq(productAvailableRoles.productId, productId));
      if (available?.length) {
        await tx
          .insert(productAvailableRoles)
          .values(
            available.map((role) => ({ productId, role: role as RoleType }))
          );
      }

      // Handle variants
      await handleVariants(
        tx,
        variants,
        defaultVariant,
        productId,
        available as RoleType[]
      );
    });

    return successRes({ id: productId }, "Product updated", 200);
  } catch (error) {
    console.error("ERROR_UPDATE_PRODUCT:", error);
    return errorRes("Internal Error", 500);
  }
}
