import { errorRes, isAuth, signJWT, successRes } from "@/lib/auth";
import { db, users, verificationOtp } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { status, userId } = await isAuth(req);

    if (!status || !userId) return errorRes("Unauthorized", 401);

    const { otp } = await req.json();

    if (!otp) {
      return errorRes("Missing token", 400);
    }

    const tokenEntry = await db.query.verificationOtp.findFirst({
      where: and(
        eq(verificationOtp.identifier, userId),
        eq(verificationOtp.otp, otp)
      ),
    });

    if (!tokenEntry) {
      return errorRes("Invalid or expired token", 400);
    }

    if (tokenEntry.expires < new Date()) {
      return errorRes("Token has expired", 400);
    }

    await db
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.id, userId));

    await db
      .delete(verificationOtp)
      .where(
        and(
          eq(verificationOtp.identifier, userId),
          eq(verificationOtp.otp, otp)
        )
      );

    const jwt = signJWT({ sub: userId, verified: true });

    return successRes({ token: jwt }, "Email verified successfully");
  } catch (error) {
    console.error("ERROR_VERIFY_EMAIL", error);
    return errorRes("Internal Error", 500);
  }
}
