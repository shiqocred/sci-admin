import { r2Public } from "@/config";
import { errorRes, successRes } from "@/lib/auth";
import { categories, db, products, suppliers } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const trendingProducts = await db
      .select({
        id: products.id,
        title: products.name,
        slug: products.slug,
        description: products.description,
      })
      .from(products)
      .orderBy(sql`RANDOM()`)
      .limit(4);

    const suppliersHome = await db
      .select({
        id: suppliers.id,
        name: suppliers.name,
        slug: suppliers.slug,
        image: suppliers.image,
      })
      .from(suppliers)
      .orderBy(sql`RANDOM()`);

    const suppliersHomeFormat = suppliersHome.map((item) => ({
      ...item,
      image: item.image ? `${r2Public}/${item.image}` : null,
    }));

    const categoriesHome = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(categories)
      .orderBy(sql`RANDOM()`);

    const response = {
      products: trendingProducts,
      suppliers: suppliersHomeFormat,
      categories: categoriesHome,
    };

    return successRes(response, "Homepage data");
  } catch (error) {
    console.log("ERROR_GET_HOMEPAGE", error);
    return errorRes("Internal Error", 500);
  }
}
