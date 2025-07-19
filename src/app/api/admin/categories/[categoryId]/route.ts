import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { categories, db, products } from "@/lib/db";
import { deleteR2, uploadToR2 } from "@/lib/providers";
import { count, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import slugify from "slugify";
import { z } from "zod/v4";
import { convertToWebP } from "@/lib/convert-image";

const categorieSchema = z.object({
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

    if (!categoryId) return errorRes("category id is required", 400);

    const categoryRes = await db.query.categories.findFirst({
      columns: {
        id: true,
        name: true,
        slug: true,
        image: true,
      },
      where: (c, { eq }) => eq(c.id, categoryId),
    });

    if (!categoryRes) return errorRes("category not found", 404);

    const categoryWithImageUrl = {
      ...categoryRes,
      image: categoryRes.image ? `${r2Public}/${categoryRes.image}` : null,
    };

    return successRes(categoryWithImageUrl, "category detail");
  } catch (error) {
    console.log("ERROR_SHOW_category:", error);
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

    const body = await req.formData();
    const nameBody = body.get("name") as string;
    const slugBody = body.get("slug") as string;
    const image = body.get("image") as File | null;

    const result = categorieSchema.safeParse({
      name: nameBody,
      slug: slugBody,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      return errorRes("Validation failed", 400, errors);
    }

    const { name, slug } = result.data;

    const existcategory = await db.query.categories.findFirst({
      columns: {
        image: true,
      },
      where: (c, { eq }) => eq(c.id, categoryId),
    });

    if (!existcategory) return errorRes("Category not found.", 404);

    if (image) {
      if (existcategory.image) await deleteR2(existcategory.image);

      const webpBuffer = await convertToWebP(image);
      const key = `images/categories/${createId()}-${slugify(name, { lower: true })}.webp`;

      const r2Up = await uploadToR2({ buffer: webpBuffer, key });

      if (!r2Up) return errorRes("Upload Failed", 400, r2Up);

      const [category] = await db
        .update(categories)
        .set({ name, slug, image: key, updatedAt: sql`NOW()` })
        .where(eq(categories.id, categoryId))
        .returning({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          image: categories.image,
        });

      const categoryWithImageUrl = {
        ...category,
        image: category.image ? `${r2Public}/${category.image}` : null,
      };

      return successRes(categoryWithImageUrl, "Category successfully created");
    }

    const [category] = await db
      .update(categories)
      .set({
        name,
        slug,
        image: existcategory.image,
        updatedAt: sql`NOW()`,
      })
      .where(eq(categories.id, categoryId))
      .returning({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        image: categories.image,
      });

    const categoryWithImageUrl = {
      ...category,
      image: category.image ? `${r2Public}/${category.image}` : null,
    };

    return successRes(categoryWithImageUrl, "Category successfully updated");
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

    // 2. Ambil data category
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
      columns: {
        id: true,
        image: true, // hanya ambil kolom yang dibutuhkan
      },
    });

    if (!category) return errorRes("Category not found", 404);

    await db.delete(categories).where(eq(categories.id, categoryId));

    if (category.image) await deleteR2(category.image);

    return successRes(null, "Category successfully deleted");
  } catch (error) {
    console.log("ERROR_DELETE_CATEGORY:", error);
    return errorRes("Internal Error", 500);
  }
}
