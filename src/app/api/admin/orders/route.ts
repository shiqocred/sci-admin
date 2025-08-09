import { auth, errorRes, successRes } from "@/lib/auth";
import { db, orderItems, orders, users } from "@/lib/db";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { asc, countDistinct, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

const sortField = (s: string) => {
  if (s === "id") return orders.id;
  return orders.createdAt;
};

export async function GET(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") ?? "";
    const sort = req.nextUrl.searchParams.get("sort") ?? "created";
    const order = req.nextUrl.searchParams.get("order") ?? "desc";

    const { where, offset, limit, pagination } = await getTotalAndPagination(
      orders,
      q,
      [orders.id],
      req
    );

    const ordersRes = await db
      .select({
        id: orders.id,
        date: orders.createdAt,
        status: orders.status,
        total_price: orders.totalPrice,
        total_item: countDistinct(orderItems.id),
        user_name: users.name,
      })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.userId))
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .where(where)
      .groupBy(orders.id, users.id)
      .orderBy(order === "desc" ? desc(sortField(sort)) : asc(sortField(sort)))
      .limit(limit)
      .offset(offset);

    const formatStatus = (
      status:
        | "WAITING_PAYMENT"
        | "PACKING"
        | "SHIPPING"
        | "DELIVERED"
        | "EXPIRED"
        | "CANCELLED"
    ) => {
      if (status === "WAITING_PAYMENT") return "waiting payment";
      if (status === "PACKING") return "processed";
      if (status === "SHIPPING") return "shipping";
      if (status === "DELIVERED") return "delivered";
      if (status === "EXPIRED") return "expired";
      return "canceled";
    };

    const ordersList = ordersRes.map((item) => ({
      ...item,
      date: `${format(new Date(item.date ?? new Date().getTime()), "PP", {
        locale: id,
      })} at ${format(new Date(item.date ?? new Date().getTime()), "HH:mm", {
        locale: id,
      })}`,
      status: formatStatus(item.status),
    }));

    const response = {
      data: ordersList,
      pagination,
    };

    return successRes(response, "Retrieve Orders");
  } catch (error) {
    console.error("ERROR_GET_ORDERS:", error);
    return errorRes("Internal Error", 500);
  }
}
