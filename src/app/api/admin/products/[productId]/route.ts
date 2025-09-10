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
  schema,
  suppliers,
} from "@/lib/db";
import { deleteR2, uploadToR2 } from "@/lib/providers";
import { generateRandomNumber } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";
import {
  and,
  asc,
  desc,
  eq,
  inArray,
  InferSelectModel,
  isNull,
  notInArray,
  sql,
} from "drizzle-orm";
import { NodePgTransaction } from "drizzle-orm/node-postgres";
import { NextRequest } from "next/server";
import slugify from "slugify";
import { z } from "zod/v4";

// ==================== TYPES ====================
type RoleType = InferSelectModel<typeof productAvailableRoles>["role"];
type MyTx = NodePgTransaction<typeof schema, any>;

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
  available: RoleType[];
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

interface ExistingVariantData {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  price: string;
  stock: string | null;
  weight: string | null;
  isDefault: boolean | null;
}

// ==================== CONSTANTS ====================
const ROLE_KEY_MAP: Record<string, keyof VariantData> = {
  BASIC: "basicPrice",
  PETSHOP: "petShopPrice",
  VETERINARIAN: "doctorPrice",
  ADMIN: "normalPrice",
} as const;

// ==================== SCHEMAS ====================
const variantSchema = z.object({
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
});

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
  defaultVariant: variantSchema.optional(),
  variants: z.array(variantSchema).optional(),
});

// ==================== UTILITIES ====================
function parseJSONField<T>(formData: FormData, key: string, fallback: T): T {
  const val = formData.get(key);
  if (!val) return fallback;

  try {
    return JSON.parse(val as string);
  } catch (error) {
    console.error(`Failed to parse JSON field ${key}:`, error);
    return fallback;
  }
}

function formatProductResponse(
  product: any,
  images: any[],
  pets: any[],
  compositions: any[],
  variants: any[],
  availableRoles: any[]
) {
  const { categoryId, categoryName, supplierId, supplierName, ...productData } =
    product;

  return {
    ...productData,
    category: categoryId ? { id: categoryId, name: categoryName } : null,
    supplier: supplierId ? { id: supplierId, name: supplierName } : null,
    images: images.map((item) => `${r2Public}/${item.url}`),
    pets,
    compositions,
    variants: variants.map((variant) => ({
      ...variant,
      pricing: variant.pricing || [],
    })),
    available: availableRoles.map((role) => role.role),
  };
}

// ==================== IMAGE HANDLERS ====================
class ImageHandler {
  static async handle(formData: FormData, productId: string, title: string) {
    const existingImages = await db.query.productImages.findMany({
      columns: { url: true, position: true },
      orderBy: asc(productImages.position),
      where: (i, { eq }) => eq(i.productId, productId),
    });

    const newImages = formData.getAll("image") as File[];
    const oldImageUrls = (formData.getAll("imageOld") as string[]).map((url) =>
      url.replace(`${r2Public}/`, "")
    );

    const removedImages = existingImages.filter(
      (item) => !oldImageUrls.includes(item.url)
    );

    // Delete removed images from R2
    await Promise.all(removedImages.map(({ url }) => deleteR2(url)));

    // Upload new images
    const uploadedKeys = await Promise.all(
      newImages.map(async (image) => {
        const buffer = await convertToWebP(image);
        const key = `images/products/${slugify(title, { lower: true })}/${createId()}.webp`;
        await uploadToR2({ buffer, key });
        return key;
      })
    );

    return {
      removedImageUrls: removedImages.map(({ url }) => url),
      uploadedKeys,
      lastPosition: Number(
        existingImages[existingImages.length - 1]?.position ?? 0
      ),
    };
  }
}

// ==================== DATABASE HANDLERS ====================
class DatabaseHandlers {
  static async handlePets(tx: MyTx, productId: string, petIds: string[]) {
    if (!petIds?.length) {
      await tx
        .delete(productToPets)
        .where(eq(productToPets.productId, productId));
      return;
    }

    const existingPets = await tx.query.productToPets.findMany({
      columns: { petId: true },
      where: (p: any, { eq }: any) => eq(p.productId, productId),
    });

    const existingPetIds = existingPets.map((p) => p.petId);
    const addedPetIds = petIds.filter((id) => !existingPetIds.includes(id));
    const removedPetIds = existingPetIds.filter((id) => !petIds.includes(id));

    const operations = [];

    if (removedPetIds.length > 0) {
      operations.push(
        tx
          .delete(productToPets)
          .where(
            and(
              eq(productToPets.productId, productId),
              inArray(productToPets.petId, removedPetIds)
            )
          )
      );
    }

    if (addedPetIds.length > 0) {
      operations.push(
        tx
          .insert(productToPets)
          .values(addedPetIds.map((petId) => ({ productId, petId })))
      );
    }

    await Promise.all(operations);
  }

  static async handleCompositions(
    tx: MyTx,
    productId: string,
    compositions: CompositionData[]
  ) {
    if (!compositions?.length) {
      await tx
        .delete(productCompositions)
        .where(eq(productCompositions.productId, productId));
      return;
    }

    const existing = await tx.query.productCompositions.findMany({
      columns: { id: true, name: true, value: true },
      where: (c: any, { eq }: any) => eq(c.productId, productId),
    });

    const operations = this.calculateCompositionOperations(
      existing,
      compositions,
      productId
    );
    await Promise.all(operations.map((op) => op(tx)));
  }

  private static calculateCompositionOperations(
    existing: any[],
    compositions: CompositionData[],
    productId: string
  ) {
    const oldIds = new Set(existing.map((c) => c.id));
    const newIds = new Set(compositions.map((c) => c.id));

    const added = compositions.filter((c) => !oldIds.has(c.id));
    const deleted = existing.filter((c) => !newIds.has(c.id));
    const updated = compositions.filter((c) => {
      const oldItem = existing.find((o) => o.id === c.id);
      return oldItem && (oldItem.name !== c.name || oldItem.value !== c.value);
    });

    const operations: Array<(tx: MyTx) => Promise<any>> = [];

    if (added.length > 0) {
      operations.push((tx) =>
        tx
          .insert(productCompositions)
          .values(added.map((c) => ({ ...c, productId })))
      );
    }

    if (deleted.length > 0) {
      operations.push((tx) =>
        tx.delete(productCompositions).where(
          inArray(
            productCompositions.id,
            deleted.map((c) => c.id)
          )
        )
      );
    }

    if (updated.length > 0) {
      operations.push((tx) =>
        Promise.all(
          updated.map((c) =>
            tx
              .update(productCompositions)
              .set({ name: c.name, value: c.value, updatedAt: sql`NOW()` })
              .where(eq(productCompositions.id, c.id))
          )
        )
      );
    }

    return operations;
  }

  static async handleAvailableRoles(
    tx: MyTx,
    productId: string,
    availableRoles: RoleType[]
  ) {
    await tx
      .delete(productAvailableRoles)
      .where(eq(productAvailableRoles.productId, productId));

    if (availableRoles?.length) {
      await tx
        .insert(productAvailableRoles)
        .values(availableRoles.map((role) => ({ productId, role })));
    }
  }
}

// ==================== VARIANT HANDLERS ====================
class VariantHandler {
  static async handle(
    tx: MyTx,
    variants: VariantData[] | undefined,
    defaultVariant: VariantData | undefined,
    productId: string,
    availableRoles: RoleType[]
  ) {
    const existingVariants = await tx.query.productVariants.findMany({
      columns: {
        id: true,
        name: true,
        sku: true,
        barcode: true,
        price: true,
        weight: true,
        stock: true,
        isDefault: true,
      },
      where: (v: any, { eq }: any) => eq(v.productId, productId),
    });

    const inputVariants = this.getInputVariants(variants, defaultVariant);
    const isDefaultVariant = !variants?.length;

    if (inputVariants.length > 0) {
      await this.processVariants(
        tx,
        existingVariants,
        inputVariants,
        productId,
        availableRoles,
        isDefaultVariant
      );
    }
  }

  private static getInputVariants(
    variants?: VariantData[],
    defaultVariant?: VariantData
  ): VariantData[] {
    if (variants?.length) return variants;
    if (defaultVariant) return [defaultVariant];
    return [];
  }

  private static async processVariants(
    tx: MyTx,
    existingVariants: ExistingVariantData[],
    variants: VariantData[],
    productId: string,
    availableRoles: RoleType[],
    isDefaultVariant: boolean
  ) {
    // Get pricing data
    const variantIds = existingVariants.map((v) => v.id);
    const allPrices = variantIds.length
      ? await tx.query.productVariantPrices.findMany({
          where: (ar: any, { inArray }: any) =>
            inArray(ar.variantId, variantIds),
        })
      : [];

    const priceMap = this.buildPriceMap(allPrices);
    const { added, deleted, updated } = this.categorizeVariants(
      existingVariants,
      variants
    );

    // Execute operations in parallel where possible
    await Promise.all([
      this.insertNewVariants(tx, added, productId, isDefaultVariant),
      this.deleteRemovedVariants(tx, deleted),
      this.updateExistingVariants(tx, updated),
    ]);

    await this.syncVariantPricing(
      tx,
      existingVariants,
      variants,
      availableRoles,
      priceMap
    );
  }

  private static buildPriceMap(allPrices: any[]) {
    const priceMap: Record<
      string,
      { id: string; price: string | number; role: RoleType }
    > = {};

    for (const p of allPrices) {
      priceMap[`${p.variantId}_${p.role}`] = {
        id: p.variantId,
        price: p.price,
        role: p.role,
      };
    }

    return priceMap;
  }

  private static categorizeVariants(
    existing: ExistingVariantData[],
    variants: VariantData[]
  ) {
    const oldIds = new Set(existing.map((v) => v.id));
    const newIds = new Set(variants.map((v) => v.id));

    return {
      added: variants.filter((v) => !oldIds.has(v.id)),
      deleted: existing.filter((v) => !newIds.has(v.id)),
      updated: variants.filter((v) => {
        const old = existing.find((o) => o.id === v.id);
        return old && this.isVariantChanged(old, v);
      }),
    };
  }

  private static isVariantChanged(
    old: ExistingVariantData,
    variant: VariantData
  ): boolean {
    return (
      old.name !== variant.name ||
      old.sku !== variant.sku ||
      old.barcode !== (variant.barcode ?? null) ||
      old.weight !== (variant.weight ?? null) ||
      old.stock !== (variant.stock ?? null)
    );
  }

  private static async insertNewVariants(
    tx: MyTx,
    added: VariantData[],
    productId: string,
    isDefaultVariant: boolean
  ) {
    if (!added.length) return;

    const addedVariants = added.map((v) => {
      const newId = createId();
      v.id = newId; // Update ID for pricing

      return {
        id: newId,
        productId,
        name: v.name,
        sku: v.sku,
        barcode: v.barcode as string,
        weight: v.weight,
        stock: v.stock,
        price: v.normalPrice,
        isDefault: isDefaultVariant,
      };
    });

    await tx.insert(productVariants).values(addedVariants);
  }

  private static async deleteRemovedVariants(
    tx: MyTx,
    deleted: ExistingVariantData[]
  ) {
    if (!deleted.length) return;

    const deletedIds = deleted.map((v) => v.id);

    await Promise.all([
      tx.delete(productVariants).where(inArray(productVariants.id, deletedIds)),
      tx
        .delete(productVariantPrices)
        .where(inArray(productVariantPrices.variantId, deletedIds)),
    ]);
  }

  private static async updateExistingVariants(
    tx: MyTx,
    updated: VariantData[]
  ) {
    if (!updated.length) return;

    await Promise.all(
      updated.map((v) =>
        tx
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
          .where(eq(productVariants.id, v.id))
      )
    );
  }

  private static async syncVariantPricing(
    tx: MyTx,
    existingVariants: ExistingVariantData[],
    variants: VariantData[],
    availableRoles: RoleType[],
    priceMap: Record<
      string,
      { id: string; price: string | number; role: RoleType }
    >
  ) {
    // Remove prices for unavailable roles
    await Promise.all(
      variants.map((v) =>
        tx
          .delete(productVariantPrices)
          .where(
            and(
              eq(productVariantPrices.variantId, v.id),
              notInArray(productVariantPrices.role, availableRoles)
            )
          )
      )
    );

    // Update main variant prices
    const changedVariants = variants.filter((v) => {
      const old = existingVariants.find((o) => o.id === v.id);
      return old && old.price !== v.normalPrice;
    });

    if (changedVariants.length > 0) {
      await Promise.all(
        changedVariants.map((v) =>
          tx
            .update(productVariants)
            .set({ price: v.normalPrice })
            .where(eq(productVariants.id, v.id))
        )
      );
    }

    // Handle role-specific pricing
    const { pricesToInsert, pricesToUpdate } = this.preparePricingOperations(
      variants,
      availableRoles,
      priceMap
    );

    const operations = [];

    if (pricesToInsert.length > 0) {
      operations.push(tx.insert(productVariantPrices).values(pricesToInsert));
    }

    if (pricesToUpdate.length > 0) {
      operations.push(
        ...pricesToUpdate.map((p) =>
          tx
            .update(productVariantPrices)
            .set({ price: p.price.toString() })
            .where(
              and(
                eq(productVariantPrices.variantId, p.id),
                eq(productVariantPrices.role, p.role)
              )
            )
        )
      );
    }

    await Promise.all(operations);
  }

  private static preparePricingOperations(
    variants: VariantData[],
    availableRoles: RoleType[],
    priceMap: Record<
      string,
      { id: string; price: string | number; role: RoleType }
    >
  ) {
    const pricesToInsert: any[] = [];
    const pricesToUpdate: {
      id: string;
      price: string | number;
      role: RoleType;
    }[] = [];

    for (const variant of variants) {
      for (const role of availableRoles) {
        const key = ROLE_KEY_MAP[role];
        const price = variant[key] ?? 0;
        const mapKey = `${variant.id}_${role}`;
        const existing = priceMap[mapKey];

        if (existing) {
          if (existing.price !== price) {
            pricesToUpdate.push({ id: existing.id, price, role });
          }
        } else {
          pricesToInsert.push({ variantId: variant.id, role, price });
        }
      }
    }

    return { pricesToInsert, pricesToUpdate };
  }
}

// ==================== API HANDLERS ====================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { productId } = await params;

    // Main product query
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
      .where(and(eq(products.id, productId), isNull(products.deletedAt)))
      .limit(1);

    if (!product) return errorRes("Product not found", 404);

    // Parallel queries for related data
    const [images, petsData, compositions, variants, availableRoles, pricings] =
      await Promise.all([
        db.query.productImages.findMany({
          columns: { url: true },
          where: (i, { eq }) => eq(i.productId, productId),
        }),
        db
          .select({ id: pets.id, name: pets.name })
          .from(productToPets)
          .leftJoin(pets, eq(pets.id, productToPets.petId))
          .where(eq(productToPets.productId, productId)),
        db.query.productCompositions.findMany({
          columns: { id: true, name: true, value: true },
          where: (c, { eq }) => eq(c.productId, productId),
        }),
        db
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
          .where(eq(productVariants.productId, productId)),
        db.query.productAvailableRoles.findMany({
          columns: { role: true },
          where: (ar, { eq }) => eq(ar.productId, productId),
        }),
        // Get pricings after getting variant IDs
        Promise.resolve([]),
      ]);

    const variantIds = variants.map((v) => v.id);
    const actualPricings = variantIds.length
      ? await db.query.productVariantPrices.findMany({
          where: (ar, { inArray }) => inArray(ar.variantId, variantIds),
        })
      : [];

    // Format variants with pricing
    const variantsWithPricing = variants.map((variant) => ({
      ...variant,
      pricing: actualPricings
        .filter((p) => p.variantId === variant.id)
        .map(({ variantId, ...rest }) => rest),
    }));

    const response = formatProductResponse(
      product,
      images,
      petsData,
      compositions,
      variantsWithPricing,
      availableRoles
    );

    return successRes(response, "Detail Product");
  } catch (error) {
    console.error("ERROR_DETAIL_PRODUCT:", error);
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

    const existingProduct = await db.query.products.findFirst({
      columns: { id: true },
      where: (p, { eq }) => eq(p.id, productId),
    });

    if (!existingProduct) return errorRes("Product not found", 404);

    const imageList = await db.query.productImages.findMany({
      columns: { url: true },
      orderBy: desc(productImages.position),
      where: (p, { eq }) => eq(p.productId, productId),
    });

    // Soft delete product
    await db
      .update(products)
      .set({ deletedAt: sql`NOW()`, updatedAt: sql`NOW()` })
      .where(eq(products.id, productId));

    // Clean up images (keep the last one as mentioned in original code)
    if (imageList.length > 1) {
      const imagesToDelete = imageList.slice(0, imageList.length - 1);

      await Promise.all([
        ...imagesToDelete.map(({ url }) => deleteR2(url)),
        db.delete(productImages).where(
          inArray(
            productImages.url,
            imagesToDelete.map((img) => img.url)
          )
        ),
      ]);
    }

    return successRes(null, "Product successfully deleted");
  } catch (error) {
    console.error("ERROR_DELETE_PRODUCT:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const formData = await req.formData();
    const { productId } = await params;

    // Parse payload
    const payload = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      indication: formData.get("indication") as string,
      dosageUsage: formData.get("dosageUsage") as string,
      storageInstruction: formData.get("storageInstruction") as string,
      packaging: formData.get("packaging") as string,
      registrationNumber: formData.get("registrationNumber") as string,
      isActive: formData.get("isActive") === "true",
      categoryId: formData.get("categoryId") as string,
      supplierId: formData.get("supplierId") as string,
      available: parseJSONField(formData, "available", []),
      petIds: parseJSONField(formData, "petId", []),
      compositions: parseJSONField(formData, "compositions", []),
      defaultVariant: parseJSONField(formData, "defaultVariant", undefined),
      variants: parseJSONField(formData, "variants", []),
    };

    // Validate payload
    const parsed = productSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        errors[err.path.join(".")] = err.message;
      });
      return errorRes("Validation failed", 400, errors);
    }

    const validatedData = parsed.data as ProductData;

    // Check if product exists
    const existingProduct = await db.query.products.findFirst({
      columns: { id: true, name: true, slug: true },
      where: (p, { eq, and, isNull }) =>
        and(eq(p.id, productId), isNull(p.deletedAt)),
    });

    if (!existingProduct) return errorRes("Product not found", 404);

    // Generate slug
    const slug =
      existingProduct.name === validatedData.title
        ? existingProduct.slug
        : slugify(`${validatedData.title}-${generateRandomNumber(5)}`, {
            lower: true,
          });

    // Execute transaction
    await db.transaction(async (tx) => {
      // Update main product
      await tx
        .update(products)
        .set({
          name: validatedData.title,
          slug,
          description: validatedData.description,
          indication: validatedData.indication,
          dosageUsage: validatedData.dosageUsage,
          storageInstruction: validatedData.storageInstruction,
          packaging: validatedData.packaging,
          registrationNumber: validatedData.registrationNumber,
          status: validatedData.isActive,
          categoryId: validatedData.categoryId,
          supplierId: validatedData.supplierId,
          updatedAt: sql`NOW()`,
        })
        .where(eq(products.id, productId));

      // Handle images
      const { uploadedKeys, removedImageUrls, lastPosition } =
        await ImageHandler.handle(formData, productId, validatedData.title);

      if (removedImageUrls.length > 0) {
        await tx
          .delete(productImages)
          .where(inArray(productImages.url, removedImageUrls));
      }

      if (uploadedKeys.length > 0) {
        await tx.insert(productImages).values(
          uploadedKeys.map((url, idx) => ({
            productId,
            url,
            position: (idx + 1 + lastPosition).toString(),
          }))
        );
      }

      // Handle related data in parallel
      await Promise.all([
        DatabaseHandlers.handlePets(tx, productId, validatedData.petIds || []),
        DatabaseHandlers.handleCompositions(
          tx,
          productId,
          validatedData.compositions || []
        ),
        DatabaseHandlers.handleAvailableRoles(
          tx,
          productId,
          validatedData.available
        ),
        VariantHandler.handle(
          tx,
          validatedData.variants,
          validatedData.defaultVariant,
          productId,
          validatedData.available
        ),
      ]);
    });

    return successRes({ id: productId }, "Product updated", 200);
  } catch (error) {
    console.error("ERROR_UPDATE_PRODUCT:", error);
    return errorRes("Internal Error", 500);
  }
}
