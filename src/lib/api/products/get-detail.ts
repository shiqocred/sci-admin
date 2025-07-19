import { r2Public } from "@/config";
import { db, productImages, products } from "@/lib/db";
import { and, eq, sql } from "drizzle-orm";

export const getProductDetail = async (productId: string) => {
  const [productExists] = await db
    .select({
      name: products.name,
      image: productImages.url,
    })
    .from(products)
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, productId),
        eq(
          productImages.id,
          sql`(
        SELECT id FROM product_images
        WHERE product_id = ${products.id}
        ORDER BY created_at ASC
        LIMIT 1
      )`
        )
      )
    )
    .where(eq(products.id, productId))
    .limit(1);

  const productFormated = {
    ...productExists,
    image: productExists.image ? `${r2Public}/${productExists.image}` : null,
  };

  return productFormated;
};
