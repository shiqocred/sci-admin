import { auth, errorRes, successRes } from "@/lib/auth";
import { db, orders, userRoleDetails, users } from "@/lib/db";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { and, asc, count, desc, eq, not, sum } from "drizzle-orm";
import { NextRequest } from "next/server";

const sortField = (s: string) => {
  if (s === "name") return users.name;
  if (s === "email") return users.email;
  if (s === "orders") return count(orders.id);
  if (s === "spent") return sum(orders.totalPrice);
  return users.createdAt;
};

export async function GET(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") ?? "";
    const sort = req.nextUrl.searchParams.get("sort") ?? "created";
    const order = req.nextUrl.searchParams.get("order") ?? "desc";

    const { where, offset, limit, pagination } = await getTotalAndPagination(
      users,
      q,
      [users.name, users.email],
      req
    );

    const customersRes = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        isVerified: users.emailVerified,
        role: users.role,
        image: users.image,
        status_role: userRoleDetails.status,
        orders: count(orders.id).as("orders"),
        amountSpent: sum(orders.totalPrice).as("amountSpent"),
      })
      .from(users)
      .leftJoin(
        orders,
        and(
          eq(orders.userId, users.id),
          and(
            not(eq(orders.status, "WAITING_PAYMENT")),
            not(eq(orders.status, "CANCELLED"))
          )
        )
      )
      .leftJoin(userRoleDetails, eq(userRoleDetails.userId, users.id))
      .where(and(where, not(eq(users.role, "ADMIN"))))
      .groupBy(users.id, userRoleDetails.status)
      .orderBy(order === "desc" ? desc(sortField(sort)) : asc(sortField(sort)))
      .limit(limit)
      .offset(offset);

    const formatRole = (
      role: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN" | null
    ) => {
      if (role === "BASIC") return "Basic";
      if (role === "PETSHOP") return "Pet Shop";
      return "Veterinarian";
    };

    const formatStatus = (
      status: "PENDING" | "APPROVED" | "REJECTED" | null
    ) => {
      if (status === "PENDING") return 1;
      if (status === "REJECTED") return 2;
      return 0;
    };

    const customersFormatted = customersRes.map((user) => ({
      ...user,
      role: formatRole(user.role),
      status_role: formatStatus(user.status_role),
      isVerified: user.isVerified !== null,
      orders: Number(user.orders),
      amountSpent: Number(user.amountSpent ?? 0),
    }));

    return successRes(
      { data: customersFormatted, pagination },
      "Customer list"
    );
  } catch (error) {
    console.log("ERROR_GET_CUSTOMERS", error);
    return errorRes("Internal Error", 500);
  }
}
