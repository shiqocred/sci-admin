import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  products,
  productImages,
  productVariants,
  productCompositions,
  InsertProductVariant,
  InsertProductComposition,
} from "@/lib/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { convertToWebP } from "@/lib/convert-image";
import { uploadToR2 } from "@/lib/providers";
import slugify from "slugify";
import { errorRes, successRes } from "@/lib/auth";
import { z } from "zod";

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
  petId: z.string().optional(),
  compositions: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  defaultVariant: z
    .object({
      id: z.string().optional(),
      name: z.string().default("default"),
      sku: z.string(),
      barcode: z.string().optional(),
      quantity: z.string(),
      salePrice: z.string(),
      compareAtPrice: z.string().optional(),
      weight: z.string(),
    })
    .optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        sku: z.string(),
        barcode: z.string().optional(),
        quantity: z.string(),
        salePrice: z.string(),
        compareAtPrice: z.string().optional(),
        weight: z.string(),
        isOpen: z.boolean().optional(),
      })
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  try {
    // 1. Parse + validate
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
      petId: formData.get("petId"),
      compositions: JSON.parse(
        (formData.get("compositions") as string) || "[]"
      ),
      defaultVariant: JSON.parse(
        (formData.get("defaultVariant") as string) || "null"
      ),
      variants: JSON.parse((formData.get("variants") as string) || "[]"),
    };

    console.log(payload);

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
      petId,
      compositions,
      defaultVariant,
      variants,
    } = parsed.data;

    console.log("s", parsed.data);

    // 2. Upload image to R2
    const image = formData.get("image") as File | null;
    let imageKey: string | undefined;

    if (image) {
      const buffer = await convertToWebP(image);
      const key = `images/${createId()}-${slugify(title, { lower: true })}.webp`;
      await uploadToR2({ buffer, key });
      imageKey = key;
    }

    // 3. Insert product
    const productId = createId();
    const slug = slugify(title, { lower: true });

    await db.insert(products).values({
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
      petId,
    });

    // 4. Insert image (only key)
    if (imageKey) {
      await db.insert(productImages).values({
        id: createId(),
        productId,
        url: imageKey, // <== ONLY THE KEY, NOT FULL URL
      });
    }

    // 5. Insert compositions
    if (compositions?.length) {
      const compositionData: InsertProductComposition[] = compositions.map(
        (c) => ({
          id: createId(),
          productId,
          name: c.name,
          value: c.value,
        })
      );
      await db.insert(productCompositions).values(compositionData);
    }

    // 6. Insert variants
    if (variants && variants.length > 0) {
      const variantData: InsertProductVariant[] = variants.map((v) => ({
        id: createId(),
        productId,
        name: v.name,
        sku: v.sku,
        barcode: v.barcode,
        price: v.salePrice,
        compareAtPrice: v.compareAtPrice ?? "0",
        stock: parseInt(v.quantity),
        weight: v.weight,
      }));
      await db.insert(productVariants).values(variantData);
    } else if (defaultVariant) {
      const defaultData: InsertProductVariant = {
        id: createId(),
        productId,
        name: defaultVariant.name,
        sku: defaultVariant.sku,
        barcode: defaultVariant.barcode,
        price: defaultVariant.salePrice,
        compareAtPrice: defaultVariant.compareAtPrice ?? "0",
        stock: parseInt(defaultVariant.quantity),
        weight: defaultVariant.weight,
        isDefault: true,
      };
      await db.insert(productVariants).values(defaultData);
    }

    return successRes({ id: productId }, "Product created", 201);
  } catch (err) {
    console.error(err);
    return errorRes("Failed to create product", 500);
  }
}
