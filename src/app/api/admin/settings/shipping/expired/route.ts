import { auth, errorRes, successRes } from "@/lib/auth";
import { db, about } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const address = await db.query.about.findFirst({
      columns: {
        expired: true,
      },
    });

    const response = address?.expired ?? null;

    return successRes(response, "Payment Expired");
  } catch (error) {
    console.error("ERROR_GET_PAYMENT_EXPIRED:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { expired } = await req.json();

    const payment = await db.query.about.findFirst({
      columns: { id: true },
    });

    if (!payment) return errorRes("Please seed about store first");

    await db
      .update(about)
      .set({
        expired,
      })
      .where(eq(about.id, payment.id));

    return successRes(null, "Payment Expired Updated");
  } catch (error) {
    console.error("ERROR_UPDATE_PAYMENT_EXPIRED:", error);
    return errorRes("Internal Error", 500);
  }
}
