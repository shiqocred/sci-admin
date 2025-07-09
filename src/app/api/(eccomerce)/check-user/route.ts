import { errorRes, isAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const auth = await isAuth(req);
  } catch (error) {
    console.log("ERROR_CHECK_USER", error);
    return errorRes("Internal Error", 500);
  }
}
