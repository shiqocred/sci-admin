import { auth, errorRes, successRes } from "@/lib/auth";
import { db, banners } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const bannerSchema = z.object({ status: z.boolean() });

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ bannerId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { bannerId } = await params;
    if (!bannerId) return errorRes("Banner id is required", 400);

    const body = await req.json();
    const result = bannerSchema.safeParse(body);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return errorRes("Validation failed", 400, errors);
    }

    const { status } = result.data;

    const bannerExist = await db.query.banners.findFirst({
      where: (d, { eq }) => eq(d.id, bannerId),
    });

    if (!bannerExist) return errorRes("Banner not found", 404);

    if (status) {
      await db
        .update(banners)
        .set({ startAt: sql`NOW()`, endAt: null })
        .where(eq(banners.id, bannerId));
    } else {
      await db
        .update(banners)
        .set({ endAt: sql`NOW()` })
        .where(eq(banners.id, bannerId));
    }

    return successRes(
      { id: bannerId },
      `Banner successfully ${status ? "activated" : "deactivated"}`
    );
  } catch (error) {
    console.error("ERROR_UPDATE_BANNER:", error);
    return errorRes("Internal Error", 500);
  }
}
