import { auth, errorRes, successRes } from "@/lib/auth";
import { db, freeShippings } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const statusFreeShippingSchema = z.object({ status: z.boolean() });

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ freeShippingId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { freeShippingId } = await params;
    if (!freeShippingId) return errorRes("Free shipping id is required", 400);

    const body = await req.json();
    const result = statusFreeShippingSchema.safeParse(body);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return errorRes("Validation failed", 400, errors);
    }

    const { status } = result.data;

    const freeShippingExist = await db.query.freeShippings.findFirst({
      where: (d, { eq }) => eq(d.id, freeShippingId),
    });

    if (!freeShippingExist) return errorRes("Free shipping not found", 404);

    if (status) {
      await db
        .update(freeShippings)
        .set({ startAt: sql`NOW()`, endAt: null })
        .where(eq(freeShippings.id, freeShippingId));
    } else {
      await db
        .update(freeShippings)
        .set({ endAt: sql`NOW()` })
        .where(eq(freeShippings.id, freeShippingId));
    }

    return successRes(
      { id: freeShippingId },
      `Free shipping successfully ${status ? "activated" : "deactivated"}`
    );
  } catch (error) {
    console.error("ERROR_UPDATE_STATUS_FREE_SHIPPING:", error);
    return errorRes("Internal Error", 500);
  }
}
