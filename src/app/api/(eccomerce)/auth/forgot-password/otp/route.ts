// resend-otp | forget-password

import ResetPassword from "@/components/email/reset-password";
import { errorRes, generateOtp, isAuth, signJWT, successRes } from "@/lib/auth";
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

    // ada users ga
    const userExists = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });

    // handle error user
    if (!userExists?.email || !userExists?.name)
      return errorRes("Email not found", 404, { email: "Email not found" });

    await db
      .delete(verificationOtp)
      .where(eq(verificationOtp.identifier, userExists.email));

    const otp = generateOtp();
    const expires = add(new Date(), { minutes: 15 });

    await db.insert(verificationOtp).values({
      identifier: userExists.email,
      otp,
      type: "PASSWORD_RESET",
      expires,
    });

    await resend.emails.send({
      from: "SCI Team<ju@support.sro.my.id>",
      to: [email],
      subject: "Reset password",
      react: ResetPassword({
        name: userExists.name,
        code: otp,
      }),
    });

    const token = signJWT({ email: userExists.email }, { expiresIn: "15m" });

    return successRes({ token }, "OTP Successfully sended");
  } catch (error) {
    console.error("ERROR_RESEND_OTP", error);
    return errorRes("Internal Error", 500);
  }
}
