import { auth, errorRes, successRes } from "@/lib/auth";
import { categories, db, products } from "@/lib/db";
import { count, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";
const categorySchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 character" }),
  slug: z.string(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { categoryId } = await params;

    if (!categoryId) return errorRes("Category id is required", 400);

    const categoryRes = await db.query.categories.findFirst({
      columns: {
        id: true,
        name: true,
        slug: true,
      },
      where: (c, { eq }) => eq(c.id, categoryId),
    });

    return successRes(categoryRes, "Category detail");
  } catch (error) {
    console.log("ERROR_SHOW_CATEGORY:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { categoryId } = await params;

    if (!categoryId) return errorRes("Category id is required", 400);

    const body = await req.json();
    const result = categorySchema.safeParse(body);
    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      return errorRes("Validation failed", 400, errors);
    }

    const { name, slug } = result.data;

    const [category] = await db
      .update(categories)
      .set({
        name,
        slug,
        updatedAt: sql`NOW()`,
      })
      .where(eq(categories.id, categoryId))
      .returning({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      });

    return successRes(category, "Category successfully updated");
  } catch (error) {
    console.log("ERROR_UPDATE_CATEGORY:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { categoryId } = await params;

    if (!categoryId) return errorRes("Category id is required", 400);

    const productMount = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.categoryId, categoryId));

    const totalProductMount = productMount[0].count;

    if (totalProductMount > 0)
      return errorRes("Category is in use and cannot be deleted.", 400);

    const categoryRes = await db
      .delete(categories)
      .where(eq(categories.id, categoryId));

    if (!categoryRes) return errorRes("Category not found", 404);

    return successRes(null, "Category successfully deleted");
  } catch (error) {
    console.log("ERROR_DELETE_CATEGORY:", error);
    return errorRes("Internal Error", 500);
  }
}
