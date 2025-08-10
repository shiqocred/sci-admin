import { auth, errorRes, successRes } from "@/lib/auth";
import { db, invoices, orders } from "@/lib/db";
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

    await db
      .update(invoices)
      .set({
        status: "PAID",
        paidAt: sql`NOW()`,
        updatedAt: sql`NOW()`,
        paymentMethod: "ADMIN",
        paymentChannel: "ADMIN",
      })
      .where(eq(invoices.orderId, orderId));

    await db
      .update(orders)
      .set({ status: "PACKING" })
      .where(eq(orders.id, orderId));

    return successRes({ id: orderId }, "Order successfully paid");
  } catch (error) {
    console.error("ERROR_PAY_ORDER:", error);
    return errorRes("Internal Error", 500);
  }
}
