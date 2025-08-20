import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { db, userRoleDetails, users } from "@/lib/db";
import { deleteR2 } from "@/lib/providers";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> } // langsung object saja, sudah resolved
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = (await params).customerId;

    const review = await db.query.userRoleDetails.findFirst({
      where: (urd, { eq }) => eq(urd.userId, userId),
      columns: {
        userId: true,
        personalId: true,
        role: true,
        personalIdFile: true,
        storefrontFile: true,
        fullName: true,
        veterinarianIdFile: true,
        veterinarianId: true,
        personalIdType: true,
        newRole: true,
      },
    });

    if (!review) return errorRes("User data not match", 404);

    const reviewFormated = {
      ...review,
      personalIdFile: review.personalIdFile
        ? `${r2Public}/${review.personalIdFile}`
        : null,
      storefrontFile:
        review.newRole === "PETSHOP" && review.storefrontFile
          ? `${r2Public}/${review.storefrontFile}`
          : null,
      veterinarianIdFile:
        review.newRole === "VETERINARIAN" && review.veterinarianIdFile
          ? `${r2Public}/${review.veterinarianIdFile}`
          : null,
    };

    return successRes(reviewFormated, "Review upgrade data");
  } catch (error) {
    console.error("ERROR_GET_REVIEW_UPGRADE", error);
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

    const { customerId: userId } = await params;
    const { status, message } = await req.json();

    if (status !== "reject" && status !== "approve")
      return errorRes("Invalid status", 422);

    if (status === "approve") {
      const userDetailExist = await db.query.userRoleDetails.findFirst({
        where: (u, { eq }) => eq(u.userId, userId),
      });

      if (!userDetailExist) return errorRes("User not match", 404);

      await Promise.all([
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

    // REJECT flow
    if (!message) return errorRes("Message is required", 422);

    const detailExist = await db.query.userRoleDetails.findFirst({
      where: (u, { eq }) => eq(u.userId, userId),
      columns: {
        veterinarianIdFile: true,
        personalIdFile: true,
        newRole: true,
      },
    });

    if (!detailExist) return errorRes("User not found", 404);

    await db
      .update(userRoleDetails)
      .set({
        status: "REJECTED",
        veterinarianIdFile: null,
        personalId: null,
        storefrontFile: null,
        personalIdFile: null,
        veterinarianId: null,
        fullName: null,
        message,
        updatedAt: sql`NOW()`,
      })
      .where(eq(userRoleDetails.userId, userId));

    // Hapus file di R2, pakai try catch supaya error delete tidak menggagalkan proses
    try {
      if (detailExist.personalIdFile)
        await deleteR2(detailExist.personalIdFile);
      if (detailExist.veterinarianIdFile)
        await deleteR2(detailExist.veterinarianIdFile);
    } catch (delError) {
      console.error("Failed deleting files in R2:", delError);
    }

    return successRes({ userId }, "Document upgrade user role rejected");
  } catch (error) {
    console.error("ERROR_APPROVE_REVIEW", error);
    return errorRes("Internal Error", 500);
  }
}
