import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { db, orders, userRoleDetails, users } from "@/lib/db";
import { deleteR2 } from "@/lib/providers";
import { format } from "date-fns";
import { and, countDistinct, eq, isNull, max, sql, sum } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> } // langsung object saja, sudah resolved
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = (await params).customerId;

    const [userDetail] = await db
      .select({
        name: users.name,
        createdAt: users.createdAt,
        email: users.email,
        emailVerified: users.emailVerified,
        id: users.id,
        image: users.image,
        phoneNumber: users.phoneNumber,
        updatedAt: userRoleDetails.updatedAt,
        newRole: userRoleDetails.newRole,
        fullName: userRoleDetails.fullName,
        message: userRoleDetails.message,
        personalId: userRoleDetails.personalId,
        personalIdFile: userRoleDetails.personalIdFile,
        personalIdType: userRoleDetails.personalIdType,
        role: userRoleDetails.role,
        status: userRoleDetails.status,
        storefrontFile: userRoleDetails.storefrontFile,
        veterinarianId: userRoleDetails.veterinarianId,
        veterinarianIdFile: userRoleDetails.veterinarianIdFile,
        totalOrder: sql`COALESCE(${countDistinct(orders.id)}, 0)`.mapWith(
          Number
        ),
        totalAmount: sql`COALESCE(${sum(orders.totalPrice)}, 0)`.mapWith(
          Number
        ),
        lastOrder: max(orders.paidAt).mapWith(Date),
      })
      .from(users)
      .leftJoin(userRoleDetails, eq(userRoleDetails.userId, users.id))
      .leftJoin(
        orders,
        and(eq(orders.userId, users.id), eq(orders.status, "DELIVERED"))
      )
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .groupBy(
        users.id,
        userRoleDetails.updatedAt,
        userRoleDetails.newRole,
        userRoleDetails.fullName,
        userRoleDetails.message,
        userRoleDetails.personalId,
        userRoleDetails.personalIdFile,
        userRoleDetails.personalIdType,
        userRoleDetails.role,
        userRoleDetails.status,
        userRoleDetails.storefrontFile,
        userRoleDetails.veterinarianId,
        userRoleDetails.veterinarianIdFile
      );

    const ordersList = await db.query.orders.findMany({
      columns: {
        id: true,
        status: true,
      },
      where: (o, { eq, and }) =>
        and(eq(o.userId, userId), eq(o.status, "DELIVERED")),
    });
    const ordersExcludeList = await db.query.orders.findMany({
      columns: {
        id: true,
        status: true,
      },
      where: (o, { eq, and, not }) =>
        and(eq(o.userId, userId), and(not(eq(o.status, "DELIVERED")))),
    });
    const addressesList = await db.query.addresses.findMany({
      columns: {
        id: true,
        name: true,
        address: true,
        city: true,
        province: true,
        district: true,
        postalCode: true,
        phoneNumber: true,
        detail: true,
      },
      where: (a, { eq }) => eq(a.userId, userId),
    });

    if (!userDetail) return errorRes("User data not match", 404);

    const detailFormatted = {
      ...userDetail,
      personalIdFile: userDetail.personalIdFile
        ? `${r2Public}/${userDetail.personalIdFile}`
        : null,
      storefrontFile:
        userDetail.newRole === "PETSHOP" && userDetail.storefrontFile
          ? `${r2Public}/${userDetail.storefrontFile}`
          : null,
      veterinarianIdFile:
        userDetail.newRole === "VETERINARIAN" && userDetail.veterinarianIdFile
          ? `${r2Public}/${userDetail.veterinarianIdFile}`
          : null,
      lastOrder: format(userDetail.lastOrder, "PP 'at' HH:mm"),
      updatedAt: userDetail.updatedAt
        ? format(userDetail.updatedAt, "PP 'at' HH:mm")
        : null,
      createdAt: userDetail.createdAt
        ? format(userDetail.createdAt, "PP 'at' HH:mm")
        : null,
      emailVerified: !!userDetail.emailVerified,
      orders: { include: ordersList, exclude: ordersExcludeList },
      addresses: addressesList.map((address) => ({
        id: address.id,
        name: address.name,
        address: `${address.address}, ${address.district}, ${address.city}, ${address.province}, ${address.postalCode}`,
        phoneNumber: address.phoneNumber,
        detail: address.detail,
      })),
    };

    return successRes(detailFormatted, "Detail Customer");
  } catch (error) {
    console.error("ERROR_GET_DETAIL_CUSTOMER", error);
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { customerId: userId } = await params;

    const userExist = await db.query.users.findFirst({
      where: (u, { eq, and, isNull }) =>
        and(eq(u.id, userId), isNull(u.deletedAt)),
    });

    if (!userExist) return errorRes("User not match", 404);

    await db
      .update(users)
      .set({ deletedAt: sql`NOW()`, updatedAt: sql`NOW()` })
      .where(eq(users.id, userId));

    return successRes({ userId }, "User successfully deleted");
  } catch (error) {
    console.error("ERROR_DELETE_USER", error);
    return errorRes("Internal Error", 500);
  }
}
