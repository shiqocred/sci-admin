import { db, userRoleDetails, users, verificationOtp } from "@/lib/db";
import { errorRes, generateOtp, signJWT, successRes } from "@/lib/auth";
import VerifyEmail from "@/components/email/verify";
import { hash } from "argon2";

import { createId } from "@paralleldrive/cuid2";
import { z } from "zod/v4";
import { add } from "date-fns";
import { resend } from "@/lib/providers";

const registerSchema = z.object({
  name: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(1, "Confirm password is required"),
  phone_number: z.string().min(1, "Phone number is required"),
});

const validationEmailExists = async (value: string) => {
  const emailFound = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, value),
  });

  return emailFound ? { email: "Email already exists" } : null;
};

const validationPassword = async (value: string) => {
  const failed = [
    { regex: /[A-Z]/, label: "one uppercase letter" },
    { regex: /[a-z]/, label: "one lowercase letter" },
    { regex: /\d/, label: "one number" },
    { regex: /[!@#$%^&*()[\]{}:;<>,.?/~_+=|\\-]/, label: "one symbol" },
  ].reduce((acc, rule) => {
    if (!rule.regex.test(value)) acc.push(rule.label);
    return acc;
  }, [] as string[]);
  const passwordError =
    value.length < 8 || failed.length > 0
      ? {
          password: `Password ${
            value.length < 8 ? "must be at least 8 characters" : ""
          } ${
            failed.length > 0 && value.length < 8
              ? "and must include at least"
              : "must include at least"
          } ${
            failed.length === 1
              ? failed[0]
              : failed.length > 1 &&
                `${failed
                  .slice(0, failed.length - 1)
                  .map((item) => item)} and ${failed[failed.length - 1]}`
          }`,
        }
      : null;

  return { failed, passwordError };
};

const validationConfirmPassword = (password: string, confirm: string) => {
  const result =
    password !== confirm
      ? { confirm_password: "Passwords do not match" }
      : null;

  return result;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      return errorRes("Validation failed", 400, errors);
    }
    const { name, email, password, confirm_password, phone_number } =
      result.data;

    const emailError = await validationEmailExists(email);

    const { failed, passwordError } = await validationPassword(password);
    const passwordMatch = validationConfirmPassword(password, confirm_password);

    if (emailError || password.length < 8 || failed.length > 0 || passwordMatch)
      return errorRes("Validation failed", emailError ? 409 : 400, {
        ...emailError,
        ...passwordError,
        ...passwordMatch,
      });

    const userId = createId();
    const user = await db
      .insert(users)
      .values({
        id: userId,
        email,
        name,
        phoneNumber: phone_number,
        password: await hash(password),
        role: "BASIC",
        emailVerified: null,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        emailVerified: users.emailVerified,
        role: users.role,
      });

    await db.insert(userRoleDetails).values({
      userId,
      role: "BASIC",
    });

    const otp = generateOtp();
    const expires = add(new Date(), { minutes: 15 });

    await db
      .insert(verificationOtp)
      .values({ identifier: email, otp, type: "EMAIL_VERIFICATION", expires });

    await resend.emails.send({
      from: "SCI Team<ju@support.sro.my.id>",
      to: [email],
      subject: "Verify your email",
      react: VerifyEmail({
        name,
        code: otp,
      }),
    });

    const jwt = signJWT({ email }, { expiresIn: "15m" });

    return successRes({ token: jwt, user: user[0] }, "Register successfully");
  } catch (error) {
    console.log("ERROR_REGISTER", error);
    return errorRes("Internal Error", 500);
  }
}
