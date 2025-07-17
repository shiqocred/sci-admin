import { r2Public } from "@/config";
import { errorRes, successRes } from "@/lib/auth";
import { categories, db, pets, products, suppliers } from "@/lib/db";
import { asc, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const suppliersFilter = await db
      .select({
        id: suppliers.id,
        name: suppliers.name,
        slug: suppliers.slug,
      })
      .from(suppliers)
      .orderBy(asc(suppliers.name));

    const categoriesFilter = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(categories)
      .orderBy(asc(categories.name));

    const petsFilter = await db
      .select({
        id: pets.id,
        name: pets.name,
        slug: pets.slug,
      })
      .from(pets)
      .orderBy(asc(pets.name));

    const response = {
      suppliers: suppliersFilter,
      categories: categoriesFilter,
      pets: petsFilter,
    };

    return successRes(response, "Select filter data");
  } catch (error) {
    console.log("ERROR_GET_SELECT_FILTER", error);
    return errorRes("Internal Error", 500);
  }
}
