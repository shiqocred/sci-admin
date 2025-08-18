import { auth, errorRes, successRes } from "@/lib/auth";
import { db, promos } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const promoSchema = z.object({ status: z.boolean() });

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ promoId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { promoId } = await params;
    if (!promoId) return errorRes("Promo id is required", 400);

    const body = await req.json();
    const result = promoSchema.safeParse(body);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return errorRes("Validation failed", 400, errors);
    }

    const { status } = result.data;

    const promoExist = await db.query.promos.findFirst({
      where: (p, { eq }) => eq(p.id, promoId),
    });

    if (!promoExist) return errorRes("Promo not found", 404);

    if (status) {
      await db
        .update(promos)
        .set({ startAt: sql`NOW()`, endAt: null })
        .where(eq(promos.id, promoId));
    } else {
      await db
        .update(promos)
        .set({ endAt: sql`NOW()` })
        .where(eq(promos.id, promoId));
    }

    return successRes(
      { id: promoId },
      `Promo successfully ${status ? "activated" : "deactivated"}`
    );
  } catch (error) {
    console.error("ERROR_UPDATE_PROMO_STATUS:", error);
    return errorRes("Internal Error", 500);
  }
}
