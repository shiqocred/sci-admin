// Resend OTP | verification-email

import VerifyEmail from "@/components/email/verify";
import { isAuth, errorRes, generateOtp, successRes, signJWT } from "@/lib/auth";
import { db, verificationOtp } from "@/lib/db";
import { resend } from "@/lib/providers";
import { add } from "date-fns";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const auth = await isAuth(req, "verify");

    if (!auth || !auth.email || auth.password)
      return errorRes("Unauthorized", 401);
    if (auth.sub) return errorRes("Already logged in", 400);

    const { email } = auth;

    const userExists = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });

    if (!userExists?.id || !userExists?.email || !userExists?.name)
      return errorRes("Unauthorized", 401);

    await db
      .delete(verificationOtp)
      .where(eq(verificationOtp.identifier, userExists.email));

    const otp = generateOtp();
    const expires = add(new Date(), { minutes: 15 });

    await db.insert(verificationOtp).values({
      identifier: userExists.email,
      otp,
      type: "EMAIL_VERIFICATION",
      expires,
    });

    await resend.emails.send({
      from: "SCI Team<ju@support.sro.my.id>",
      to: [userExists.email],
      subject: "Verify your email",
      react: VerifyEmail({
        name: userExists.name,
        code: otp,
      }),
    });

    const jwt = signJWT({ email }, { expiresIn: "15m" });

    return successRes({ token: jwt }, "OTP Successfully sended");
  } catch (error) {
    console.error("ERROR_RESEND_OTP", error);
    return errorRes("Internal Error", 500);
  }
}
