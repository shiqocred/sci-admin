import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { db, userRoleDetails, users } from "@/lib/db";
import { deleteR2 } from "@/lib/providers";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized 1", 401);

    const userId = (await params).customerId;

    const review = await db.query.userRoleDetails.findFirst({
      where: (urd, { eq }) => eq(urd.userId, userId),
      columns: {
        userId: true,
        nik: true,
        role: true,
        fileKtp: true,
        storefront: true,
        name: true,
        fileKta: true,
        noKta: true,
      },
    });

    if (!review) return errorRes("User data not match", 404);

    const reviewFormated = {
      ...review,
      fileKtp: `${r2Public}/${review.fileKtp}`,
      storefront: review.storefront ? `${r2Public}/${review.storefront}` : null,
      fileKta: review.fileKta ? `${r2Public}/${review.fileKta}` : null,
    };

    return successRes(reviewFormated, "Review upgrade data");
  } catch (error) {
    console.log("ERROR_GET_REVIEW_UPGRADE", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = (await params).customerId;

    const { status, message } = await req.json();

    if (status !== "reject" && status !== "approve")
      return errorRes("Invalid status", 422);

    if (status === "approve") {
      const userDetailExist = await db.query.userRoleDetails.findFirst({
        where: (u, { eq }) => eq(u.userId, userId),
      });

      if (!userDetailExist) return errorRes("User not match", 404);

      Promise.all([
        db
          .update(users)
          .set({ role: userDetailExist.newRole, updatedAt: sql`NOW()` })
          .where(eq(users.id, userId)),

        db
          .update(userRoleDetails)
          .set({
            status: "APPROVED",
            role: userDetailExist.newRole,
            updatedAt: sql`NOW()`,
          })
          .where(eq(userRoleDetails.userId, userId)),
      ]);

      return successRes({ userId }, "User approved to upgrade role");
    }

    if (!message) return errorRes("Message is required", 422);

    const detailExist = await db.query.userRoleDetails.findFirst({
      where: (u, { eq }) => eq(u.userId, userId),
      columns: {
        fileKta: true,
        fileKtp: true,
      },
    });

    if (!detailExist) return errorRes("User not found", 404);

    await db
      .update(userRoleDetails)
      .set({
        status: "REJECTED",
        fileKta: null,
        fileKtp: null,
        storefront: null,
        nik: null,
        noKta: null,
        name: null,
        message,
        updatedAt: sql`NOW()`,
      })
      .where(eq(userRoleDetails.userId, userId));

    if (detailExist.fileKtp) await deleteR2(detailExist.fileKtp);
    if (detailExist.fileKta) await deleteR2(detailExist.fileKta);

    return successRes({ userId }, "Document upgrade user role rejected");
  } catch (error) {
    console.log("ERROR_APPROVE_REVIEW", error);
    return errorRes("Internal Error", 500);
  }
}
