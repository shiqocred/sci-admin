import { auth, errorRes, successRes } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const categoriesRes = await db.query.categories.findMany({
      columns: {
        id: true,
        name: true,
      },
    });
    const suppliersRes = await db.query.suppliers.findMany({
      columns: {
        id: true,
        name: true,
      },
    });
    const petsRes = await db.query.pets.findMany({
      columns: {
        id: true,
        name: true,
      },
    });

    const response = {
      categories: categoriesRes,
      suppliers: suppliersRes,
      pets: petsRes,
    };

    return successRes(response, "Selects list");
  } catch (error) {
    console.log("ERROR_GET_SELECTS", error);
    return errorRes("Internal Error", 500);
  }
}
