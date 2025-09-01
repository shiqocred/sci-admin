import { auth, errorRes, successRes } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const policies = await db.query.policies.findFirst();

    if (!policies) return errorRes("No policies data, please seed first");

    const response = {
      privacy: policies?.privacy,
      return: policies?.return,
      termOfUse: policies?.termOfUse,
    };

    return successRes(response, "Retrieve policies");
  } catch (error) {
    console.error("ERROR_GET_POLICIES:", error);
    return errorRes("Internal Error", 500);
  }
}
