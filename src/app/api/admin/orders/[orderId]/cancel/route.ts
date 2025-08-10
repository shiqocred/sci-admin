import { auth, errorRes, successRes } from "@/lib/auth";
import { db, invoices, orders, shippings } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { orderId } = await params;

    const orderExist = await db.query.orders.findFirst({
      columns: { id: true },
      where: (o, { eq }) => eq(o.id, orderId),
    });

    if (!orderExist) return errorRes("Order not found", 404);

    await db.transaction(async (tx) => {
      await Promise.all([
        tx
          .update(invoices)
          .set({
            status: "CANCELLED",
            cancelledAt: sql`NOW()`,
            updatedAt: sql`NOW()`,
          })
          .where(eq(invoices.orderId, orderId)),
        tx
          .update(orders)
          .set({ status: "CANCELLED" })
          .where(eq(orders.id, orderId)),
        tx
          .update(shippings)
          .set({ status: "CANCELLED" })
          .where(eq(shippings.orderId, orderId)),
      ]);
    });

    return successRes({ id: orderId }, "Order successfully paid");
  } catch (error) {
    console.error("ERROR_PAY_ORDER:", error);
    return errorRes("Internal Error", 500);
  }
}
