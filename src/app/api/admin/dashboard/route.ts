import { auth, errorRes, successRes } from "@/lib/auth";
import { db, orders, userRoleDetails, users } from "@/lib/db";
import { formatRupiah } from "@/lib/utils";
import { eq, isNull, or } from "drizzle-orm";

export async function GET() {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);
    const ordersRes = await db
      .select({
        id: orders.id,
        amount: orders.totalPrice,
        date: orders.createdAt,
        status: orders.status,
      })
      .from(orders)
      .where(or(eq(orders.status, "DELIVERED"), eq(orders.status, "PACKING")));

    const customersRes = await db
      .select({
        id: users.id,
        name: users.name,
        new_role: userRoleDetails.newRole,
        status: userRoleDetails.status,
      })
      .from(users)
      .leftJoin(userRoleDetails, eq(userRoleDetails.userId, users.id))
      .where(isNull(users.deletedAt));

    const totalAmount = ordersRes
      .filter((o) => o.status === "DELIVERED")
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const totalOrders = ordersRes.filter(
      (o) => o.status === "DELIVERED"
    ).length;
    const totalCustomers = customersRes.length;

    const response = {
      total: {
        customers: totalCustomers.toLocaleString(),
        income: formatRupiah(totalAmount),
        order: totalOrders.toLocaleString(),
      },
      needed: {
        approve_document: customersRes
          .filter((o) => o.status === "PENDING")
          .map((u) => ({ id: u.id, role: u.new_role, name: u.name })),
        confirm_order: ordersRes
          .filter((o) => o.status === "PACKING")
          .map((o) => ({ id: o.id, date: (o.date as Date).toISOString() })),
      },
    };
    return successRes(response, "Retrieve dashboard");
  } catch (error) {
    console.error("ERROR_GET_DASHBOARD:", error);
    return errorRes("Internal Error", 500);
  }
}
