import { auth, errorRes, successRes } from "@/lib/auth";
import { db, storeDetail } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const address = await db.query.storeDetail.findFirst({
      columns: {
        address: true,
        longitude: true,
        latitude: true,
      },
    });

    const response = address
      ? {
          address: address.address,
          lat: address.latitude,
          long: address.longitude,
        }
      : null;

    return successRes(response, "Store Address");
  } catch (error) {
    console.error("ERROR_GET_STORE_LOCATION:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { address, lat, long } = await req.json();

    const addressExist = await db.query.storeDetail.findFirst({
      columns: { id: true },
    });

    if (!addressExist) return errorRes("Please seed storeDetail first");

    await db
      .update(storeDetail)
      .set({
        address,
        latitude: lat,
        longitude: long,
      })
      .where(eq(storeDetail.id, addressExist.id));

    return successRes(null, "Store Address Updated");
  } catch (error) {
    console.error("ERROR_UPDATE_STORE_LOCATION:", error);
    return errorRes("Internal Error", 500);
  }
}
