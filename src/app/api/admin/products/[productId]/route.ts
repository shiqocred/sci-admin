import { auth, errorRes, successRes } from "@/lib/auth";
import { db, products } from "@/lib/db";
import { deleteR2 } from "@/lib/providers";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function DELETE(
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
      },
      where: (p, { eq }) => eq(p.id, productId),
    });

    if (!existProduct) return errorRes("Product not found", 404);

    const iamgeList = await db.query.productImages.findMany({
      columns: {
        url: true,
      },
      where: (p, { eq }) => eq(p.productId, productId),
    });

    await db.delete(products).where(eq(products.id, productId));

    if (iamgeList.length > 0) {
      for (const image of iamgeList) {
        await deleteR2(image.url);
      }
    }

    return successRes(null, "Product successfully deleted");
  } catch (error) {
    console.log("ERROR_DELETE_PRODUCT:", error);
    return errorRes("Internal Error", 500);
  }
}
