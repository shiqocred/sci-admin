import { auth, errorRes, successRes } from "@/lib/auth";
import { db, storeAddress } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const address = await db.query.storeAddress.findFirst({
      columns: {
        longitude: true,
        latitude: true,
      },
    });

    const response = address
      ? {
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

    const { lat, long } = await req.json();

    const address = await db.query.storeAddress.findFirst({
      columns: { id: true },
    });

    if (!address) return errorRes("Please seed storeAddress first");

    await db
      .update(storeAddress)
      .set({
        latitude: lat,
        longitude: long,
      })
      .where(eq(storeAddress.id, address.id));

    return successRes(null, "Store Address Updated");
  } catch (error) {
    console.error("ERROR_UPDATE_STORE_LOCATION:", error);
    return errorRes("Internal Error", 500);
  }
}
