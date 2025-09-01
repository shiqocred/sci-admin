import { auth, errorRes, successRes } from "@/lib/auth";
import { db, policies } from "@/lib/db";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const { value } = await req.json();

    await db.update(policies).set({ termOfUse: value });

    return successRes(null, "Term of use successfully updated");
  } catch (error) {
    console.error("ERROR_UPDATE_TERM_OF_USE:", error);
    return errorRes("Internal Error", 500);
  }
}
