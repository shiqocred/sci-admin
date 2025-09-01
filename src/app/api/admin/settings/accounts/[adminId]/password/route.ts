import { auth, errorRes, successRes } from "@/lib/auth";
import { db, users } from "@/lib/db";
import { hash } from "argon2";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const adminSchema = z.object({
  password: z.string().min(8, { message: "Password at least 8 character" }),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const { adminId } = await params;

    const body = await req.json();

    const result = adminSchema.safeParse(body);

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      return errorRes("Validation failed", 400, errors);
    }

    const { password } = result.data;

    const adminExist = await db.query.users.findFirst({
      where: (u, { eq, and, isNull }) =>
        and(eq(u.role, "ADMIN"), isNull(u.deletedAt), eq(u.id, adminId)),
    });

    if (!adminExist) return errorRes("Account not found", 404);

    const hashesPassword = await hash(password);

    await db
      .update(users)
      .set({
        password: hashesPassword,
        updatedAt: sql`NOW()`,
      })
      .where(eq(users.id, adminId));

    return successRes(null, "Password account successfully updated");
  } catch (error) {
    console.error("ERROR_UPDATE_PASSWORD_ADMIN_ACCOUNTS:", error);
    return errorRes("Internal Error", 500);
  }
}
