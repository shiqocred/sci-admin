// verify-otp | verification-email

import { isAuth, errorRes, signJWT, successRes } from "@/lib/auth";
import { db, users, verificationOtp } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const auth = await isAuth(req, "verify");

    if (!auth || !auth.email || auth.password)
      return errorRes("Unauthorized", 401);
    if (auth.sub) return errorRes("Already logged in", 400);

    const { email } = auth;

    const { otp } = await req.json();

    if (!otp) {
      return errorRes("Missing token", 400);
    }

    const tokenEntry = await db.query.verificationOtp.findFirst({
      where: and(
        eq(verificationOtp.identifier, email),
        eq(verificationOtp.otp, otp)
      ),
    });

    if (!tokenEntry) return errorRes("Invalid or expired token", 400);

    if (tokenEntry.expires < new Date())
      return errorRes("Token has expired", 400);

    const now = new Date();
    const [user] = await db
      .update(users)
      .set({ emailVerified: now, updatedAt: now })
      .where(eq(users.email, email))
      .returning({
        id: users.id,
      });

    await db
      .delete(verificationOtp)
      .where(
        and(eq(verificationOtp.identifier, email), eq(verificationOtp.otp, otp))
      );

    const jwt = signJWT({ sub: user.id }, { expiresIn: "7d" });

    return successRes({ token: jwt }, "Email verified successfully");
  } catch (error) {
    console.error("ERROR_VERIFY_EMAIL", error);
    return errorRes("Internal Error", 500);
  }
}
