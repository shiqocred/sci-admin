import { userRoleDetails, users } from "../schema";
import { seed } from "drizzle-seed";
import { hash } from "argon2";
import { createId } from "@paralleldrive/cuid2";
import { drizzle } from "drizzle-orm/node-postgres";
import { databaseUrl } from "@/config";

async function main() {
  const db = drizzle(databaseUrl);
  const passHashes = await hash("12345678");
  const userId = createId();
  await seed(db, { users, userRoleDetails }).refine((f) => ({
    users: {
      columns: {
        id: f.default({
          defaultValue: userId,
        }),
        email: f.default({
          defaultValue: "example@mail.com",
        }),
        password: f.default({
          defaultValue: passHashes,
        }),
        name: f.default({
          defaultValue: "sroo",
        }),
        role: f.default({
          defaultValue: "BASIC",
        }),
      },
      count: 1,
    },
    userRoleDetails: {
      columns: {
        userId: f.default({
          defaultValue: userId,
        }),
        role: f.default({
          defaultValue: "BASIC",
        }),
        isVerified: f.default({
          defaultValue: true,
        }),
      },
      count: 1,
    },
  }));
}
main();
