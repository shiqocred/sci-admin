import { r2Public } from "@/config";
import { db, productImages, products } from "@/lib/db";
import { and, eq, isNull, sql } from "drizzle-orm";

export const getProductDetail = async (productId: string) => {
  const [productExists] = await db
    .select({
      name: products.name,
      image: sql`
      (SELECT ${productImages.url} 
       FROM ${productImages} 
       WHERE ${productImages.productId} = ${products.id} 
       ORDER BY ${productImages.position} ASC 
       LIMIT 1)`.as("image"),
    })
    .from(products)
    .where(and(eq(products.id, productId), isNull(products.deletedAt)))
    .limit(1);

  const productFormated = {
    ...productExists,
    image: productExists?.image
      ? `${r2Public}/${productExists.image as string}`
      : null,
  };

  return productFormated;
};
