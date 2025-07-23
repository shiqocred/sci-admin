import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { convertToWebP } from "@/lib/convert-image";
import {
  categories,
  db,
  pets,
  productCompositions,
  productImages,
  products,
  productToPets,
  productVariants,
  suppliers,
} from "@/lib/db";
import { deleteR2, uploadToR2 } from "@/lib/providers";
import { createId } from "@paralleldrive/cuid2";
import { eq, inArray, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import slugify from "slugify";
import { z } from "zod/v4";

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
  basicPrice: string;
  petShopPrice: string;
  doctorPrice: string;
  weight: string;
}

interface ExistingImageData {
  id: string;
  url: string;
}

interface ExistingPetData {
  petId: string;
}

interface ExistingCompositionData {
  id: string;
  name: string;
  value: string;
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
      basicPrice: z.string(),
      petShopPrice: z.string(),
      doctorPrice: z.string(),
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
        basicPrice: z.string(),
        petShopPrice: z.string(),
        doctorPrice: z.string(),
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
        normalPrice: productVariants.normalPrice,
        basicPrice: productVariants.basicPrice,
        petShopPrice: productVariants.petShopPrice,
        doctorPrice: productVariants.doctorPrice,
        sku: productVariants.sku,
        barcode: productVariants.barcode,
        stock: productVariants.stock,
        weight: productVariants.weight,
      })
      .from(productVariants)
      .where(eq(productVariants.productId, productId));

    const response = {
      ...productFormated,
      images: images.map((item) => `${r2Public}/${item.url}`),
      pets: petsRow,
      compositions,
      variants,
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
  // --- Image Handling ---
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

  const uploadedKeys: string[] = [];

  // --- Combine DB and R2 operations into transaction ---
  await db.transaction(async (tx) => {
    // 1. Delete removed images from DB
    if (removedImageId.length > 0) {
      await tx
        .delete(productImages)
        .where(inArray(productImages.id, removedImageId));
    }

    // 2. Delete removed images from R2 (outside transaction, but batched)
    if (removedImageKey.length > 0) {
      await Promise.all(removedImageKey.map((key) => deleteR2(key)));
    }

    // 3. Upload new images to R2 and prepare keys
    for (const image of images) {
      const buffer = await convertToWebP(image);
      const key = `images/products/${createId()}-${slugify(title, { lower: true })}.webp`;
      await uploadToR2({ buffer, key }); // Assuming uploadToR2 is not awaited for DB insert
      uploadedKeys.push(key);
    }

    // 4. Insert new image records into DB
    if (uploadedKeys.length > 0) {
      await tx.insert(productImages).values(
        uploadedKeys.map((url) => ({
          id: createId(),
          productId,
          url,
        }))
      );
    }
  });
};

const petHandle = async (tx: any, productId: string, petIds: string[]) => {
  // --- Pet Handling ---
  const petsExist: ExistingPetData[] = await tx.query.productToPets.findMany({
    columns: { petId: true },
    where: (p: any, { eq }: { eq: any }) => eq(p.productId, productId),
  });

  const existingPetIds = petsExist.map((e) => e.petId);
  const addedPetIds = petIds.filter((id) => !existingPetIds.includes(id));
  const removedPetIds = existingPetIds.filter((id) => !petIds.includes(id));

  // Perform operations within the transaction context (tx)
  if (removedPetIds.length > 0) {
    await tx
      .delete(productToPets)
      .where(inArray(productToPets.petId, removedPetIds));
  }
  if (addedPetIds.length > 0) {
    await tx.insert(productToPets).values(
      addedPetIds.map((petId) => ({
        productId,
        petId,
      }))
    );
  }
};

const compositionHandle = async (
  tx: any, // Accept transaction context
  productId: string,
  compositions: CompositionData[]
) => {
  // --- Composition Handling ---
  const compositionExist: ExistingCompositionData[] =
    await tx.query.productCompositions.findMany({
      columns: { id: true, name: true, value: true },
      where: (c: any, { eq }: { eq: any }) => eq(c.productId, productId),
    });

  const oldCompositionIds = new Set(compositionExist.map((item) => item.id));
  const newCompositionIds = new Set(compositions.map((item) => item.id));

  const addedComposition = compositions.filter(
    (item) => !oldCompositionIds.has(item.id)
  );
  const deletedComposition = compositionExist.filter(
    (item) => !newCompositionIds.has(item.id)
  );
  const updatedComposition = compositions.filter((newItem) => {
    const oldItem = compositionExist.find((old) => old.id === newItem.id);
    return (
      oldItem &&
      (oldItem.name !== newItem.name || oldItem.value !== newItem.value)
    ); // More efficient comparison
  });

  // Perform operations within the transaction context (tx)
  if (addedComposition.length > 0) {
    await tx.insert(productCompositions).values(
      addedComposition.map((item) => ({
        ...item,
        productId,
      }))
    );
  }
  if (deletedComposition.length > 0) {
    const deletedIds = deletedComposition.map((item) => item.id);
    await tx
      .delete(productCompositions)
      .where(inArray(productCompositions.id, deletedIds));
  }
  if (updatedComposition.length > 0) {
    await Promise.all(
      updatedComposition.map((item) =>
        tx
          .update(productCompositions)
          .set({
            name: item.name,
            value: item.value,
            updatedAt: sql`NOW()`,
          })
          .where(eq(productCompositions.id, item.id))
      )
    );
  }
};

const handleIsVariant = async (
  tx: any, // Accept transaction context
  variantExist: ExistingVariantData[],
  variants: VariantData[],
  productId: string
) => {
  // --- Handle Non-Default Variants ---
  if (variantExist[0]?.isDefault) {
    // If previously default, delete all and insert new variants
    await tx
      .delete(productVariants)
      .where(eq(productVariants.productId, productId));
    if (variants.length > 0) {
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
    }
  } else {
    // Otherwise, perform diff and update
    const oldVariantIds = new Set(variantExist.map((item) => item.id));
    const newVariantIds = new Set(variants.map((item) => item.id)); // Fix: was newCompositionIds

    const addedVariant = variants.filter((item) => !oldVariantIds.has(item.id));
    const deletedVariant = variantExist.filter(
      (item) => !newVariantIds.has(item.id)
    );
    const updatedVariant = variants.filter((newItem) => {
      const oldItem = variantExist.find((old) => old.id === newItem.id);
      if (!oldItem) return false;
      // More efficient comparison
      return (
        oldItem.name !== newItem.name ||
        oldItem.sku !== newItem.sku ||
        oldItem.barcode !== (newItem.barcode ?? null) ||
        oldItem.normalPrice !== newItem.normalPrice ||
        oldItem.basicPrice !== (newItem.basicPrice ?? null) ||
        oldItem.petShopPrice !== (newItem.petShopPrice ?? null) ||
        oldItem.doctorPrice !== (newItem.doctorPrice ?? null) ||
        oldItem.stock !== (newItem.stock ?? null) ||
        oldItem.weight !== (newItem.weight ?? null)
      );
    });

    // Perform operations within the transaction context (tx)
    if (addedVariant.length > 0) {
      await tx.insert(productVariants).values(
        addedVariant.map((v) => ({
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
    }
    if (deletedVariant.length > 0) {
      const deletedIds = deletedVariant.map((item) => item.id);
      await tx
        .delete(productVariants)
        .where(inArray(productVariants.id, deletedIds));
    }
    if (updatedVariant.length > 0) {
      await Promise.all(
        updatedVariant.map((item) =>
          tx
            .update(productVariants)
            .set({
              name: item.name,
              sku: item.sku,
              barcode: item.barcode,
              normalPrice: item.normalPrice,
              basicPrice: item.basicPrice,
              petShopPrice: item.petShopPrice,
              doctorPrice: item.doctorPrice,
              stock: item.stock,
              weight: item.weight,
              updatedAt: sql`NOW()`,
            })
            .where(eq(productVariants.id, item.id))
        )
      );
    }
  }
};

const handleDefaultVariant = async (
  tx: any, // Accept transaction context
  variantExist: ExistingVariantData[],
  defaultVariant: VariantData,
  productId: string
) => {
  // --- Handle Default Variant ---
  if (!variantExist[0]?.isDefault) {
    // If previously not default, delete all and insert new default
    await tx
      .delete(productVariants)
      .where(eq(productVariants.productId, productId));
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
  } else if (variantExist[0].isDefault) {
    // If previously default, check for updates
    const oldItem = variantExist[0];
    // More efficient comparison
    const isChanged =
      oldItem.id !== defaultVariant.id ||
      oldItem.name !== defaultVariant.name ||
      oldItem.sku !== defaultVariant.sku ||
      oldItem.barcode !== (defaultVariant.barcode ?? null) ||
      oldItem.normalPrice !== defaultVariant.normalPrice ||
      oldItem.basicPrice !== (defaultVariant.basicPrice ?? null) ||
      oldItem.petShopPrice !== (defaultVariant.petShopPrice ?? null) ||
      oldItem.doctorPrice !== (defaultVariant.doctorPrice ?? null) ||
      oldItem.stock !== (defaultVariant.stock ?? null) ||
      oldItem.weight !== (defaultVariant.weight ?? null);

    if (isChanged) {
      await tx
        .update(productVariants)
        .set({
          id: defaultVariant.id,
          name: defaultVariant.name,
          sku: defaultVariant.sku,
          barcode: defaultVariant.barcode,
          normalPrice: defaultVariant.normalPrice,
          basicPrice: defaultVariant.basicPrice,
          petShopPrice: defaultVariant.petShopPrice,
          doctorPrice: defaultVariant.doctorPrice,
          stock: defaultVariant.stock,
          weight: defaultVariant.weight,
          updatedAt: sql`NOW()`,
        })
        .where(eq(productVariants.id, oldItem.id)); // Use oldItem.id for WHERE clause
    }
  }
};

const handleVariants = async (
  tx: any, // Accept transaction context
  variants: VariantData[] | undefined,
  defaultVariant: VariantData | undefined,
  productId: string
) => {
  // --- Variant Handling Logic ---
  const variantExist: ExistingVariantData[] =
    await tx.query.productVariants.findMany({
      columns: {
        id: true,
        barcode: true,
        basicPrice: true,
        doctorPrice: true,
        isDefault: true,
        name: true,
        normalPrice: true,
        petShopPrice: true,
        sku: true,
        stock: true,
        weight: true,
      },
      where: (v: any, { eq }: { eq: any }) => eq(v.productId, productId),
    });

  if (variants && variants.length > 0) {
    await handleIsVariant(tx, variantExist, variants, productId);
  } else if (defaultVariant) {
    await handleDefaultVariant(tx, variantExist, defaultVariant, productId);
  } else {
    // If neither variants nor defaultVariant, delete existing variants
    await tx
      .delete(productVariants)
      .where(eq(productVariants.productId, productId));
  }
};

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
    }: ProductData = parsed.data;

    const slug = slugify(title, { lower: true });

    // --- Main Transaction ---
    await db.transaction(async (tx) => {
      // 1. Update main product details
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
          updatedAt: sql`NOW()`, // Optional: Update timestamp
        })
        .where(eq(products.id, productId));

      // 2. Handle Images (including DB operations)
      await imageHandle(formData, productId, title); // Pass tx if needed inside

      // 3. Handle Pets
      if (petIds && petIds.length > 0) {
        await petHandle(tx, productId, petIds);
      } else {
        // If petIds is empty or null, remove all existing associations
        await tx
          .delete(productToPets)
          .where(eq(productToPets.productId, productId));
      }

      // 4. Handle Compositions
      if (compositions?.length) {
        await compositionHandle(tx, productId, compositions);
      } else {
        // If compositions is empty or null, remove all existing ones
        await tx
          .delete(productCompositions)
          .where(eq(productCompositions.productId, productId));
      }

      // 5. Handle Variants
      await handleVariants(tx, variants, defaultVariant, productId); // Pass tx
    });

    return successRes({ id: productId }, "Product updated", 200); // 200 OK is more standard for updates
  } catch (error) {
    console.error("ERROR_UPDATE_PRODUCT:", error);
    // Return specific error message if possible, otherwise generic
    if (error instanceof Error) {
      return errorRes(error.message, 500);
    }
    return errorRes("Internal Error", 500);
  }
}
