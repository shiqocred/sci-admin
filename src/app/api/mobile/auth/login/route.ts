// route.ts (Next.js App Router)
import { db } from "@/lib/db";
import { errorRes, signJWT, successRes } from "@/lib/auth";
import { verify } from "argon2";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });
    if (!user || !user.password) return errorRes("Invalid credentials", 401);

    const match = await verify(user.password, password);
    if (!match) return errorRes("Invalid credentials", 401);

    const token = signJWT({ sub: user.id });

    const {
      emailVerified,
      image,
      password: passwordUser,
      ...userFormated
    } = user;

    return successRes({ token, user: userFormated }, "Login successfully");
  } catch (error) {
    console.log("ERROR_LOGIN", error);
    return errorRes("Internal Error", 500);
  }
}
