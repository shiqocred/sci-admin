import { auth, errorRes, successRes } from "@/lib/auth";
import { pets, db } from "@/lib/db";

export async function GET() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const petsRes = await db
      .select({
        id: pets.id,
        name: pets.name,
      })
      .from(pets);

    return successRes(petsRes, "Category list");
  } catch (error) {
    console.log("ERROR_GET_PETS_SELECT", error);
    return errorRes("Internal Error", 500);
  }
}
