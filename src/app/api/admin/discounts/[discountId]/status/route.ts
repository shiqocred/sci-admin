import { auth, errorRes, successRes } from "@/lib/auth";
import { db, discounts } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const discountSchema = z.object({ status: z.boolean() });

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ discountId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { discountId } = await params;
    if (!discountId) return errorRes("Discount id is required", 400);

    const body = await req.json();
    const result = discountSchema.safeParse(body);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return errorRes("Validation failed", 400, errors);
    }

    const { status } = result.data;

    const discountExist = await db.query.discounts.findFirst({
      where: (d, { eq }) => eq(d.id, discountId),
    });

    if (!discountExist) return errorRes("Discount not found", 404);

    await db
      .update(discounts)
      .set({ isActive: status })
      .where(eq(discounts.id, discountId));

    return successRes(
      { id: discountId },
      `Discount successfully ${status ? "activated" : "deactivated"}`
    );
  } catch (error) {
    console.error("ERROR_UPDATE_DISCOUNT:", error);
    return errorRes("Internal Error", 500);
  }
}
