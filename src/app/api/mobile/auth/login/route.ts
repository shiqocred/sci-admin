import { db } from "@/lib/db";
import { errorRes, signJWT, successRes } from "@/lib/auth";
import { verify } from "argon2";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });
    if (!user?.id || !user?.password)
      return errorRes("Invalid credentials", 401);

    const match = await verify(user.password, password);
    if (!match) return errorRes("Invalid credentials", 401);

    const token = signJWT({ sub: user.id, verified: !!user.emailVerified });

    return successRes(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
      },
      "Login successfully"
    );
  } catch (error) {
    console.log("ERROR_LOGIN", error);
    return errorRes("Internal Error", 500);
  }
}
