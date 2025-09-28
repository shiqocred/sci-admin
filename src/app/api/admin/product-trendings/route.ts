import { auth, errorRes, successRes } from "@/lib/auth";
import {
  db,
  productImages,
  products,
  productTrendings,
  productVariants,
} from "@/lib/db";
import { and, eq, isNull, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { r2Public } from "@/config";
import { buildWhereClause } from "@/lib/search";

export async function GET(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") ?? "";

    const where = buildWhereClause(q, [products.name, products.slug]);

    const productTrending = await db
      .select({
        id: products.id,
        name: products.name,
        image: sql<string>`
      (SELECT ${productImages.url} 
       FROM ${productImages} 
       WHERE ${productImages.productId} = ${products.id} 
       ORDER BY ${Number(productImages.position)} ASC 
       LIMIT 1)`.as("image"),
        position: productTrendings.position,
      })
      .from(products)
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(productTrendings, eq(productTrendings.productId, products.id))
      .where(
        and(
          where,
          isNull(products.deletedAt),
          sql`${productVariants.stock} > 0`,
          eq(products.status, true)
        )
      )
      .groupBy(products.id, productTrendings.position);

    const productTrendingFormated = productTrending.map((item) => ({
      ...item,
      image: item.image ? `${r2Public}/${item.image}` : null,
    }));

    return successRes(productTrendingFormated, "Categories list");
  } catch (error) {
    console.log("ERROR_GET_CATEGORIES", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { productId, position } = await req.json();

    await db.insert(productTrendings).values({ productId, position });

    return successRes(null, "Trending Product Successfully Created");
  } catch (error) {
    console.log("ERROR_CREATE_TRENDING_PRODUCT:", error);
    return errorRes("Internal Error", 500);
  }
}
