import { auth, errorRes, successRes } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const users = await db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
      },
    });
    return successRes(users, "Selects User list");
  } catch (error) {
    console.error("ERROR_GET_USER_SELECTS", error);
    return errorRes("Internal Error", 500);
  }
}
