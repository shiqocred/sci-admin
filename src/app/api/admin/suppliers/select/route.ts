import { auth, errorRes, successRes } from "@/lib/auth";
import { suppliers, db } from "@/lib/db";

export async function GET() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const suppliersRes = await db
      .select({
        id: suppliers.id,
        name: suppliers.name,
      })
      .from(suppliers);

    return successRes(suppliersRes, "Category list");
  } catch (error) {
    console.log("ERROR_GET_SUPPLIERS_SELECT", error);
    return errorRes("Internal Error", 500);
  }
}
