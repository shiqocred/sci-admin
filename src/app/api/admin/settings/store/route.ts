import { auth, errorRes, successRes } from "@/lib/auth";
import { about, db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const about = await db.query.about.findFirst();

    if (!about) return errorRes("No store data, please seed first");

    const response = {
      store: {
        name: about?.name,
        address: about?.address,
        phone: about?.phone,
      },
      service: {
        whatsapp: about?.whatsapp,
        message: about?.message,
      },
      sosmed: {
        facebook: about?.facebook,
        linkedin: about?.linkedin,
        instagram: about?.instagram,
      },
    };

    return successRes(response, "Retrieve store");
  } catch (error) {
    console.error("ERROR_GET_STORE:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const { name, address, phone } = await req.json();

    await db.update(about).set({ name, address, phone });

    return successRes(null, "Store successfully updated");
  } catch (error) {
    console.error("ERROR_UPDATE_STORE:", error);
    return errorRes("Internal Error", 500);
  }
}
