// route.ts (Next.js App Router)
import { db, users } from "@/lib/db";
import { errorRes, signJWT, successRes } from "@/lib/auth";
import { hash } from "argon2";

import { createId } from "@paralleldrive/cuid2";
import { z } from "zod/v4";

const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string().min(1, "Confirm password is required"),
  phone_number: z.string().min(1, "Phone number is required"),
});

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

      return errorRes("Validation failed", 422, errors);
    }
    const {
      first_name,
      last_name,
      email,
      password,
      confirm_password,
      phone_number,
    } = result.data;

    // cek email udah dipakai belum
    const emailFound = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });

    const emailError = emailFound ? { email: "Email already exists" } : null;
    const failed = [
      { regex: /[A-Z]/, label: "one uppercase letter" },
      { regex: /[a-z]/, label: "one lowercase letter" },
      { regex: /\d/, label: "one number" },
      { regex: /[!@#$%^&*()[\]{}:;<>,.?/~_+=|\\-]/, label: "one symbol" },
    ].reduce((acc, rule) => {
      if (!rule.regex.test(password)) acc.push(rule.label);
      return acc;
    }, [] as string[]);
    const passwordError =
      password.length < 8 || failed.length > 0
        ? {
            password: `Password ${
              password.length < 8 ? "must be at least 8 characters" : ""
            } ${
              failed.length > 0 && password.length < 8
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
    console.log(passwordError, failed);
    const passwordMatch =
      password !== confirm_password
        ? { confirm_password: "Passwords do not match" }
        : null;

    if (emailError || password.length < 8 || failed.length > 0 || passwordMatch)
      return errorRes("Validation failed", 422, {
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
        name: first_name,
        password: await hash(password),
        role: "BASIC",
        emailVerified: null,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        role: users.role,
      });

    const token = signJWT({ sub: userId, verified: false });

    return successRes({ token, user: user[0] }, "Register successfully");
  } catch (error) {
    console.log("ERROR_REGISTER", error);
    return errorRes("Internal Error", 500);
  }
}
