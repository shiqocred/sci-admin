import { auth, errorRes, successRes } from "@/lib/auth";
import { db, productTrendings } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ position: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { position } = await params;

    const { productId } = await req.json();

    await db
      .update(productTrendings)
      .set({ productId })
      .where(eq(productTrendings.position, position));

    return successRes(null, "Trending Product Successfully Updated");
  } catch (error) {
    console.log("ERROR_UPDATE_TRENDING_PRODUCT:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ position: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { position } = await params;

    await db
      .delete(productTrendings)
      .where(eq(productTrendings.position, position));

    return successRes(null, "Trending Product Successfully Deleted");
  } catch (error) {
    console.log("ERROR_DELETE_TRENDING_PRODUCT:", error);
    return errorRes("Internal Error", 500);
  }
}
