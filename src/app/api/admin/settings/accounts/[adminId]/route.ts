import { auth, errorRes, successRes } from "@/lib/auth";
import { db, users } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const { adminId } = await params;

    const adminAccount = await db.query.users.findFirst({
      where: (u, { eq, and, isNull }) =>
        and(eq(u.role, "ADMIN"), isNull(u.deletedAt), eq(u.id, adminId)),
    });

    if (!adminAccount) return errorRes("Account not found", 404);

    const response = {
      id: adminAccount.id,
      name: adminAccount.name,
      email: adminAccount.email,
      phone: adminAccount.phoneNumber,
    };

    return successRes(response, "Retrieve admin account");
  } catch (error) {
    console.error("ERROR_GET_ADMIN_ACCOUNT:", error);
    return errorRes("Internal Error", 500);
  }
}

const adminSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email address is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const body = await req.json();

    const { adminId } = await params;

    const result = adminSchema.safeParse(body);

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      return errorRes("Validation failed", 400, errors);
    }

    const { name, email, phone } = result.data;

    const adminExist = await db.query.users.findFirst({
      where: (u, { eq, and, isNull }) =>
        and(
          eq(u.role, "ADMIN"),
          eq(u.email, email),
          isNull(u.deletedAt),
          eq(u.id, adminId)
        ),
    });

    if (!adminExist) return errorRes("Account not found", 404);

    await db
      .update(users)
      .set({
        name,
        phoneNumber: phone,
        email,
        updatedAt: sql`NOW()`,
      })
      .where(eq(users.id, adminId));

    return successRes({ id: adminId }, "Admin account successfully updated");
  } catch (error) {
    console.error("ERROR_UPDATE_ADMIN_ACCOUNTS:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const { adminId } = await params;

    const adminExist = await db.query.users.findFirst({
      where: (u, { eq, and, isNull }) =>
        and(eq(u.role, "ADMIN"), isNull(u.deletedAt), eq(u.id, adminId)),
    });

    if (!adminExist) return errorRes("Account not found", 404);

    await db
      .update(users)
      .set({
        deletedAt: sql`NOW()`,
        updatedAt: sql`NOW()`,
      })
      .where(eq(users.id, adminId));

    return successRes(null, "Admin account successfully deleted");
  } catch (error) {
    console.error("ERROR_DELETE_ADMIN_ACCOUNTS:", error);
    return errorRes("Internal Error", 500);
  }
}
