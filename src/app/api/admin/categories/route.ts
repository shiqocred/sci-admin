import { auth, errorRes, successRes } from "@/lib/auth";
import { categories, db, products } from "@/lib/db";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { asc, count, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

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
        totalProducts: count(products.id).as("totalProducts"),
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .where(where)
      .groupBy(categories.id)
      .orderBy(order === "desc" ? desc(sortField(sort)) : asc(sortField(sort)))
      .limit(limit)
      .offset(offset);

    return successRes({ data: categoriesRes, pagination }, "Category list");
  } catch (error) {
    console.log("ERROR_GET_CATEGORIES", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

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
      .insert(categories)
      .values({
        name,
        slug,
      })
      .returning({ name: categories.name, slug: categories.slug });

    return successRes(category, "Category successfully created");
  } catch (error) {
    console.log("ERROR_CREATE_CATEGORY:", error);
    return errorRes("Internal Error", 500);
  }
}
