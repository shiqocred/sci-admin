import { auth, errorRes, successRes } from "@/lib/auth";
import { categories, db, products } from "@/lib/db";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { uploadToR2 } from "@/lib/providers";
import { createId } from "@paralleldrive/cuid2";
import { asc, count, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import slugify from "slugify";
import { z } from "zod/v4";
import { r2Public } from "@/config";
import { convertToWebP } from "@/lib/convert-image";

const categorySchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 character" }),
  slug: z.string(),
});

const sortField = (s: string) => {
  if (s === "name") return categories.name;
  if (s === "slug") return categories.slug;
  if (s === "products") return count(products.id);
  return categories.createdAt;
};

export async function GET(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") ?? "";
    const sort = req.nextUrl.searchParams.get("sort") ?? "created";
    const order = req.nextUrl.searchParams.get("order") ?? "desc";

    const { where, offset, limit, pagination } = await getTotalAndPagination(
      categories,
      q,
      [categories.name, categories.slug],
      req
    );

    const categoriesRes = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        image: categories.image,
        totalProducts: count(products.id).as("totalProducts"),
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .where(where)
      .groupBy(categories.id)
      .orderBy(order === "desc" ? desc(sortField(sort)) : asc(sortField(sort)))
      .limit(limit)
      .offset(offset);

    const categoriesResFormated = categoriesRes.map((item) => ({
      ...item,
      image: item.image ? `${r2Public}/${item.image}` : null,
    }));

    return successRes(
      { data: categoriesResFormated, pagination },
      "Categories list"
    );
  } catch (error) {
    console.log("ERROR_GET_CATEGORIES", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const body = await req.formData();
    const nameBody = body.get("name") as string;
    const slugBody = body.get("slug") as string;
    const image = body.get("image") as File | null;

    const result = categorySchema.safeParse({ name: nameBody, slug: slugBody });

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      return errorRes("Validation failed", 400, errors);
    }

    const { name, slug } = result.data;

    if (image) {
      const webpBuffer = await convertToWebP(image);
      const key = `images/categories/${createId()}-${slugify(name, { lower: true })}.webp`;

      const r2Up = await uploadToR2({ buffer: webpBuffer, key });

      if (!r2Up) return errorRes("Upload Failed", 400, r2Up);

      const [category] = await db
        .insert(categories)
        .values({
          name,
          slug,
          image: key,
        })
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
      .insert(categories)
      .values({
        name,
        slug,
      })
      .returning({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      });

    return successRes(category, "Category Successfully created");
  } catch (error) {
    console.log("ERROR_CREATE_CATEGORY:", error);
    return errorRes("Internal Error", 500);
  }
}
