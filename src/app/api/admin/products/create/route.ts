import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { products, productImages, productVariants } from "@/lib/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { convertToWebP } from "@/lib/convert-image";
import { uploadToR2 } from "@/lib/providers";
import slugify from "slugify";
import { errorRes, successRes } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const supplierId = formData.get("supplierId") as string;
    const petId = formData.get("petId") as string;
    const status = formData.get("status") === "true";

    // Single variant (jika tanpa variasi)
    const sku = formData.get("sku") as string;
    const barcode = formData.get("barcode") as string;
    const price = formData.get("price") as string;
    const compareAtPrice = formData.get("compareAtPrice") as string;
    const stock = Number(formData.get("stock"));
    const weight = formData.get("weight") as string;

    const images = formData.getAll("images") as File[];

    const productId = createId();

    // Insert produk
    await db.insert(products).values({
      id: productId,
      name,
      slug,
      description,
      categoryId,
      supplierId,
      petId,
      status,
    });

    // Insert default variant
    await db.insert(productVariants).values({
      id: createId(),
      productId,
      name,
      sku,
      barcode,
      price,
      compareAtPrice,
      stock,
      weight,
      isDefault: true,
    });

    // Upload & insert gambar
    for (const file of images) {
      const buffer = await convertToWebP(file);
      const key = `images/${createId()}-${slugify(name, { lower: true })}.webp`;
      const r2Up = await uploadToR2({ buffer, key });

      if (!r2Up) return errorRes("Upload Failed", 400, r2Up);

      await db.insert(productImages).values({
        id: createId(),
        productId,
        url: key,
      });
    }

    return successRes(null, "Product Successfully created");
  } catch (error) {
    console.log("ERROR_CREATE_PRODUCT:", error);
    return errorRes("Internal Error", 500);
  }
}
