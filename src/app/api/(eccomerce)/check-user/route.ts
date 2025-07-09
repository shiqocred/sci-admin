import { errorRes, isAuth, successRes } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      return errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    return successRes({ userId }, "Authorized");
  } catch (error) {
    console.log("ERROR_CHECK_USER", error);
    return errorRes("Internal Error", 500);
  }
}
