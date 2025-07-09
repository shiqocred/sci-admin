// app/api/auth/oauth/google/route.ts
import { NextRequest } from "next/server";
import { db, users, accounts } from "@/lib/db";
import { createId } from "@paralleldrive/cuid2";
import { signJWT, successRes, errorRes, verifyGoogleToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return errorRes("Missing idToken", 400);

    const payload = await verifyGoogleToken(idToken);

    const email = payload.email!;
    const googleId = payload.sub;
    const name = payload.name ?? null;
    const image = payload.picture ?? null;

    // Cek apakah akun Google ini sudah pernah login
    const account = await db.query.accounts.findFirst({
      where: (a, { eq, and }) =>
        and(eq(a.provider, "google"), eq(a.providerAccountId, googleId)),
    });

    let userId: string;
    let isNew = false;

    if (account) {
      userId = account.userId;
    } else {
      // Buat user baru
      const [user] = await db
        .insert(users)
        .values({
          id: createId(),
          email,
          name,
          image,
          emailVerified: new Date(),
          role: "BASIC",
        })
        .returning({ id: users.id });

      userId = user.id;
      isNew = true;

      // Tambahkan akun Google ke tabel account
      await db.insert(accounts).values({
        userId,
        provider: "google",
        providerAccountId: googleId,
        type: "oauth",
      });
    }

    const jwt = signJWT({ sub: userId, verified: true });

    return successRes(
      {
        token: jwt,
        is_new: isNew,
      },
      isNew ? "Account created via Google" : "Login success"
    );
  } catch (err) {
    console.error(err);
    return errorRes("Google OAuth failed", 500);
  }
}
