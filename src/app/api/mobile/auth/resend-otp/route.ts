import VerifyEmail from "@/components/email/verify";
import { resendSecret } from "@/config";
import { errorRes, generateOtp, isAuth, successRes } from "@/lib/auth";
import { db, verificationOtp } from "@/lib/db";
import { add } from "date-fns";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

const resend = new Resend(resendSecret);

export async function POST(req: Request) {
  try {
    const { status, userId } = await isAuth(req);

    if (!status || !userId) return errorRes("Unauthorized", 401);

    const userExists = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });

    if (!userExists?.id || !userExists?.email || !userExists?.name)
      return errorRes("Unauthorized", 401);

    await db
      .delete(verificationOtp)
      .where(eq(verificationOtp.identifier, userExists.id));

    const otp = generateOtp();
    const expires = add(new Date(), { minutes: 15 });

    await db
      .insert(verificationOtp)
      .values({ identifier: userExists.id, otp, expires });

    await resend.emails.send({
      from: "SCI Team<ju@support.sro.my.id>",
      to: [userExists.email],
      subject: "Verify your email",
      react: VerifyEmail({
        name: userExists.name,
        code: otp,
      }),
    });

    return successRes(null, "OTP Successfully sended");
  } catch (error) {
    console.error("ERROR_RESEND_OTP", error);
    return errorRes("Internal Error", 500);
  }
}
