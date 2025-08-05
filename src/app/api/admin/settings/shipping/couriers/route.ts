import { auth, errorRes, successRes } from "@/lib/auth";
import { couriers, db } from "@/lib/db";
import { asc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const couriersRaw = await db.query.couriers.findMany({
      columns: {
        id: true,
        name: true,
        value: true,
        isActive: true,
      },
      orderBy: asc(couriers.value),
    });

    if (couriersRaw.length < 1)
      return errorRes("Please seed courier data first.");

    const response = couriersRaw.map((c) => ({
      id: c.id,
      name: c.name,
      value: c.value,
      status: c.isActive,
    }));

    return successRes(response, "Couriers retrieved successfully");
  } catch (error) {
    console.error("ERROR_GET_COURIERS:", error);
    return errorRes("Internal Error", 500);
  }
}
export async function PUT(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const body: { id: string; status: boolean }[] = await req.json();

    for (const item of body) {
      await db
        .update(couriers)
        .set({ isActive: item.status })
        .where(eq(couriers.id, item.id));
    }

    return successRes(null, "Couriers Updated");
  } catch (error) {
    console.error("ERROR_UPDATE_COURIERS:", error);
    return errorRes("Internal Error", 500);
  }
}
