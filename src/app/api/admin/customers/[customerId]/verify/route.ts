import { auth, errorRes, successRes } from "@/lib/auth";
import { db, users } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { customerId: userId } = await params;

    const userExist = await db.query.users.findFirst({
      where: (u, { eq, and, isNull }) =>
        and(eq(u.id, userId), isNull(u.deletedAt)),
    });

    if (!userExist) return errorRes("User not match", 404);
    if (userExist.emailVerified)
      return errorRes("Email has been verified", 422);

    await db
      .update(users)
      .set({ emailVerified: sql`NOW()`, updatedAt: sql`NOW()` })
      .where(eq(users.id, userId));

    return successRes({ userId }, "Email successfully verified");
  } catch (error) {
    console.error("ERROR_VERIFY_EMAIL", error);
    return errorRes("Internal Error", 500);
  }
}
