import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, accounts, sessions, users, verificationTokens } from "../db";
import { verify } from "argon2";

export async function authorizeWithCredentials(
  email: string,
  password: string
) {
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  });

  if (!user || !user.password) return null;

  const isValid = await verify(user.password, password);

  if (!isValid) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

class CustomError extends CredentialsSignin {
  code = "credential_not_match";
}

export const { handlers, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const user = await authorizeWithCredentials(
            credentials.email as string,
            credentials.password as string
          );

          if (!user || user.role !== "ADMIN") {
            throw new CustomError();
          }

          return user;
        } catch (error) {
          console.log("CREDENTIALS", error);
          throw new CustomError();
        }
      },
    }),
  ],
  pages: {
    error: "/login",
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // User is available during sign-in
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
});
