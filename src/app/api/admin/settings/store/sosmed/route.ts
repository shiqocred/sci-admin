import { auth, errorRes, successRes } from "@/lib/auth";
import { about, db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const { facebook, linkedin, instagram } = await req.json();

    await db.update(about).set({ facebook, linkedin, instagram });

    return successRes(null, "Sosmed successfully updated");
  } catch (error) {
    console.error("ERROR_UPDATE_SOSMED:", error);
    return errorRes("Internal Error", 500);
  }
}
