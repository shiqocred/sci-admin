// send-otp | forget-password

import ResetPassword from "@/components/email/reset-password";
import { errorRes, generateOtp, signJWT, successRes } from "@/lib/auth";
import { db, verificationOtp } from "@/lib/db";
import { resend } from "@/lib/providers";
import { add } from "date-fns";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) return errorRes("Email is required", 400);

    const userExists = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });

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
    console.error("ERROR_SEND_OTP", error);
    return errorRes("Internal Error", 500);
  }
}
