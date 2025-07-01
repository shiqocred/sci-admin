import { auth, errorRes, successRes } from "@/lib/auth";
import { db, products } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function PUT(
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
        status: true,
      },
      where: (p, { eq }) => eq(p.id, productId),
    });

    if (!existProduct) return errorRes("Product not found", 404);

    const [newStatus] = await db
      .update(products)
      .set({
        status: !existProduct.status,
      })
      .where(eq(products.id, productId))
      .returning({
        id: products.id,
      });

    return successRes(newStatus, "Product Successfully chaged status");
  } catch (error) {
    console.error("ERROR_CHANGE_STATUS:", error);
    return errorRes("Internal Error", 500);
  }
}
