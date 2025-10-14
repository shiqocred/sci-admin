import { auth, errorRes, successRes } from "@/lib/auth";
import { categories, db, pets, suppliers } from "@/lib/db";

export async function GET() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const [supplierRes, categoriesRes, petsRes] = await Promise.all([
      db.select({ value: suppliers.id, label: suppliers.name }).from(suppliers),
      db
        .select({ value: categories.id, label: categories.name })
        .from(categories),
      db.select({ value: pets.id, label: pets.name }).from(pets),
    ]);

    return successRes({
      suppliers: supplierRes,
      categories: categoriesRes,
      pets: petsRes,
    });
  } catch (error) {
    console.error("ERROR_GET_PRODUCT_FILTER_EXPORT:", error);
    return errorRes("Internal Error", 500);
  }
}
