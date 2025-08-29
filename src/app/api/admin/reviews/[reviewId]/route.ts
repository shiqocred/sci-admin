import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { db, products, testimonies, testimoniProduct } from "@/lib/db";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const { reviewId } = await params;

    const reviewExist = await db.query.testimonies.findFirst({
      where: (t, { eq }) => eq(t.id, reviewId),
    });

    if (!reviewExist) return errorRes("Review not found", 404);

    const reviewProducts = await db
      .select({
        name: products.name,
        id: products.id,
      })
      .from(testimoniProduct)
      .leftJoin(products, eq(products.id, testimoniProduct.productId))
      .where(eq(testimoniProduct.testimoniId, reviewId));

    const reviewImages = await db.query.testimoniImage.findMany({
      where: (ti, { eq }) => eq(ti.testimoniId, reviewId),
    });

    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, reviewExist.userId),
    });

    const response = {
      id: reviewExist.id,
      title: reviewExist.title,
      rating: Number(reviewExist.rating),
      description: reviewExist.message,
      status: reviewExist.isActive ? "publish" : "unpublish",
      timestamp: format(reviewExist.createdAt, "PPP, HH:mm", { locale: id }),
      images: reviewImages.map((i) => (i.url ? `${r2Public}/${i.url}` : null)),
      orderId: reviewExist.orderId,
      product: reviewProducts.map((i) => ({
        id: i.id as string,
        name: i.name as string,
      })),
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        image: user?.image ? `${r2Public}/${user?.image}` : null,
      },
    };

    return successRes(response, "Retrieve detail testimoni");
  } catch (error) {
    console.error("ERROR_GET_TESTIMONI:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const { reviewId } = await params;

    const { status } = await req.json();

    const review = await db
      .update(testimonies)
      .set({
        isActive: status as boolean,
      })
      .where(eq(testimonies.id, reviewId));

    if (!review) return errorRes("Testimoni not found", 404);

    return successRes({ id: reviewId }, "Testimoni successfully updated");
  } catch (error) {
    console.error("ERROR_UPDATE_TESTIMONI:", error);
    return errorRes("Internal Error", 500);
  }
}
