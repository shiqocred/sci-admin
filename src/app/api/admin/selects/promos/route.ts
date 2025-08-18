import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const productsRes = await db.execute(sql`
      SELECT DISTINCT ON (p.id)
        p.id,
        p.name,
        p.status,
        pi.url as image
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id
      ORDER BY p.id, pi.created_at ASC
    `);

    const response = productsRes.rows.map((product) => ({
      ...product,
      image: product.image ? `${r2Public}/${product.image as string}` : null,
    }));

    return successRes(response, "Selects list");
  } catch (error) {
    console.log("ERROR_GET_SELECTS", error);
    return errorRes("Internal Error", 500);
  }
}
