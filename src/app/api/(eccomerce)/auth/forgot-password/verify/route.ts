// verify-otp | forget-password

import { errorRes, isAuth, signJWT, successRes } from "@/lib/auth";
import { db, verificationOtp } from "@/lib/db";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const auth = await isAuth(req, "verify");

    if (!auth || !auth.email || auth.password)
      return errorRes("Unauthorized", 401);
    if (auth.sub) return errorRes("Already logged in", 400);

    const { email } = auth;

    // ada users ga
    const userExists = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });

    // handle error user
    if (!userExists?.id || !userExists?.email || !userExists?.name)
      return errorRes("Unauthorized", 401);

    // ada json otp ga
    const { otp } = await req.json();

    // handle error otp
    if (!otp) return errorRes("Missing OTP code", 400);

    // cek token sama email sama ga
    const tokenEntry = await db.query.verificationOtp.findFirst({
      where: and(
        eq(verificationOtp.identifier, email),
        eq(verificationOtp.otp, otp)
      ),
    });

    // handle error not match
    if (!tokenEntry) return errorRes("Invalid or expired token", 400);

    // handle error token expired
    if (tokenEntry.expires < new Date())
      return errorRes("Token has expired", 400);

    await db
      .delete(verificationOtp)
      .where(
        and(eq(verificationOtp.identifier, email), eq(verificationOtp.otp, otp))
      );

    const token = signJWT({ password: userExists.id }, { expiresIn: "1d" });

    return successRes({ token }, "OTP Successfully verified");
  } catch (error) {
    console.error("ERROR_VERIFY_OTP", error);
    return errorRes("Internal Error", 500);
  }
}
