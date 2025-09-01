import { auth, errorRes, successRes } from "@/lib/auth";
import { db, userRoleDetails, users } from "@/lib/db";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { createId } from "@paralleldrive/cuid2";
import { hash } from "argon2";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const sortField = (s: string) => {
  if (s === "name") return users.name;
  if (s === "email") return users.email;
  return users.createdAt;
};

export async function GET(req: NextRequest) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") ?? "";
    const sort = req.nextUrl.searchParams.get("sort") ?? "created";
    const order = req.nextUrl.searchParams.get("order") ?? "desc";

    const { where, offset, limit, pagination } = await getTotalAndPagination(
      users,
      q,
      [users.name, users.email],
      req
    );

    const adminAccounts = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(and(where, eq(users.role, "ADMIN"), isNull(users.deletedAt)))
      .orderBy(order === "desc" ? desc(sortField(sort)) : asc(sortField(sort)))
      .limit(limit)
      .offset(offset);

    const response = {
      data: adminAccounts.map((account) => ({
        id: account.id,
        name: account.name,
        email: account.email,
      })),
      pagination,
    };

    return successRes(response, "Retrieve admin accounts");
  } catch (error) {
    console.error("ERROR_GET_ADMIN_ACCOUNTS:", error);
    return errorRes("Internal Error", 500);
  }
}

const adminSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email address is required" }),
  password: z.string().min(8, { message: "Password at least 8 character" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
});

export async function POST(req: NextRequest) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

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

    const { name, email, password, phone } = result.data;

    const adminExist = await db.query.users.findFirst({
      where: (u, { eq, and, isNull }) =>
        and(eq(u.role, "ADMIN"), eq(u.email, email), isNull(u.deletedAt)),
    });

    if (adminExist)
      return errorRes("Admin account already exist", 400, {
        email: "Email is ready exist",
      });

    const hashesPassword = await hash(password);

    const adminId = createId();

    await db.insert(users).values({
      id: adminId,
      name,
      phoneNumber: phone,
      password: hashesPassword,
      email,
      role: "ADMIN",
    });

    await db.insert(userRoleDetails).values({
      userId: adminId,
      role: "ADMIN",
      newRole: "ADMIN",
    });

    return successRes(null, "Admin account successfully created");
  } catch (error) {
    console.error("ERROR_CREATE_ADMIN_ACCOUNTS:", error);
    return errorRes("Internal Error", 500);
  }
}
