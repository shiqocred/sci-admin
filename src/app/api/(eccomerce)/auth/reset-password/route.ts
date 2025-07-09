import { errorRes, isAuth, successRes } from "@/lib/auth";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";
import { hash } from "argon2";

const registerSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(1, "Confirm password is required"),
});

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

export async function POST(req: NextRequest) {
  try {
    const auth = await isAuth(req, "verify");

    if (!auth || auth.email || !auth.password)
      return errorRes("Unauthorized", 401);
    if (auth.sub) return errorRes("Already logged in", 400);

    const { password: userId } = auth;

    // ada users ga
    const userExists = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });

    // handle error user
    if (!userExists?.id || !userExists?.email || !userExists?.name)
      return errorRes("Unauthorized", 401);

    // get body
    const body = await req.json();

    // parse velidasi dan body
    const result = registerSchema.safeParse(body);

    // handle error validasi
    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      return errorRes("Validation failed", 400, errors);
    }

    const { password, confirm_password } = result.data;

    const { failed, passwordError } = await validationPassword(password);
    const passwordMatch = validationConfirmPassword(password, confirm_password);

    if (password.length < 8 || failed.length > 0 || passwordMatch)
      return errorRes("Validation failed", 400, {
        ...passwordError,
        ...passwordMatch,
      });

    const [user] = await db
      .update(users)
      .set({ password: await hash(password) })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    return successRes({ userId: user.id }, "Password successfully reseted");
  } catch (error) {
    console.error("ERROR_RESET_PASSWORD", error);
    return errorRes("Internal Error", 500);
  }
}
