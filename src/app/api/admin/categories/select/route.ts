import { auth, errorRes, successRes } from "@/lib/auth";
import { categories, db } from "@/lib/db";

export async function GET() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const categoriesRes = await db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(categories);

    return successRes(categoriesRes, "Category list");
  } catch (error) {
    console.log("ERROR_GET_CATEGORIES_SELECT", error);
    return errorRes("Internal Error", 500);
  }
}
