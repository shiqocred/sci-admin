import { auth, errorRes, successRes } from "@/lib/auth";
import { about, db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const { whatsapp, message } = await req.json();

    await db.update(about).set({ whatsapp, message });

    return successRes(null, "Service successfully updated");
  } catch (error) {
    console.error("ERROR_UPDATE_SERVICE:", error);
    return errorRes("Internal Error", 500);
  }
}
