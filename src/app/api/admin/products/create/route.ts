import { NextResponse } from "next/server";
import { z } from "zod";
import {
  db,
  products,
  productVariants,
  productVariantItems,
  productVariantCombinations,
  productVariantCombinationItems,
} from "@/lib/db";
import { createId } from "@paralleldrive/cuid2";

const VariantSchema = z.object({
  name: z.string(),
  items: z.array(z.string()),
});

const CombinationSchema = z.object({
  sku: z.string(),
  quantity: z.number(),
  salePrice: z.string(),
  compareAtPrice: z.string().optional(),
  weight: z.string(),
  image: z.string().optional(),
  items: z.record(z.string(), z.string()), // record<variantName, variantItemValue>
});

const CreateProductSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  categoryId: z.string(),
  supplierId: z.string(),
  petId: z.string(),
  variants: z.array(VariantSchema).optional(),
  combinations: z.array(CombinationSchema).optional(),
  default: z
    .object({
      sku: z.string(),
      quantity: z.number(),
      salePrice: z.string(),
      compareAtPrice: z.string().optional(),
      weight: z.string(),
      image: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateProductSchema.parse(body);

    const productId = createId();

    // 1️⃣ Insert products
    await db.insert(products).values({
      id: productId,
      name: parsed.name,
      slug: parsed.slug,
      status: false,
      dosageUsage: "",
      indication: "",
      packaging: "",
      registrationNumber: "",
      petId: parsed.petId,
      storageInstruction: "",
      description: parsed.description,
      categoryId: parsed.categoryId,
      supplierId: parsed.supplierId,
    });

    // 2️⃣ Kalau tanpa varian, buat kombinasi default
    if (!parsed.variants || parsed.variants.length === 0) {
      if (!parsed.default)
        throw new Error("Missing default data for non-variant product");

      await db.insert(productVariantCombinations).values({
        id: createId(),
        productId,
        sku: parsed.default.sku,
        quantity: parsed.default.quantity,
        salePrice: parsed.default.salePrice,
        compareAtPrice: parsed.default.compareAtPrice,
        weight: parsed.default.weight,
        image: parsed.default.image,
      });

      return NextResponse.json({
        success: true,
        message: "Product created (no variants)",
      });
    }

    // 3️⃣ Insert productVariants dan productVariantItems
    const variantIdMap = new Map<string, string>();
    const itemIdMap = new Map<string, string>(); // key: variantName + itemValue

    for (const variant of parsed.variants) {
      const variantId = createId();
      variantIdMap.set(variant.name, variantId);

      await db.insert(productVariants).values({
        id: variantId,
        productId,
        name: variant.name,
      });

      for (const item of variant.items) {
        const itemId = createId();
        itemIdMap.set(`${variant.name}:${item}`, itemId);

        await db.insert(productVariantItems).values({
          id: itemId,
          productVariantId: variantId,
          name: item,
        });
      }
    }

    // 4️⃣ Insert kombinasi akhir
    for (const combo of parsed.combinations ?? []) {
      const combinationId = createId();

      await db.insert(productVariantCombinations).values({
        id: combinationId,
        productId,
        sku: combo.sku,
        quantity: combo.quantity,
        salePrice: combo.salePrice,
        compareAtPrice: combo.compareAtPrice,
        weight: combo.weight,
        image: combo.image,
      });

      // ⛓ Insert relasi kombinasi → variantItems
      for (const [variantName, itemValue] of Object.entries(combo.items)) {
        const variantItemId = itemIdMap.get(`${variantName}:${itemValue}`);
        if (!variantItemId) {
          throw new Error(`Invalid variantItem: ${variantName} / ${itemValue}`);
        }

        await db.insert(productVariantCombinationItems).values({
          id: createId(),
          combinationId,
          variantItemId,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Product with variants created",
    });
  } catch (err: any) {
    console.error("Product creation error:", err);
    return NextResponse.json(
      { error: err.message ?? "Invalid request" },
      { status: 400 }
    );
  }
}
