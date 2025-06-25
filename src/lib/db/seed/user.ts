import { users } from "../schema";
import { seed } from "drizzle-seed";
import { hash } from "argon2";
import { createId } from "@paralleldrive/cuid2";
import { db } from "../client";

async function main() {
  const passHashes = await hash("12345678");
  await seed(db, { users }).refine((f) => ({
    users: {
      columns: {
        id: f.default({
          defaultValue: createId(),
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
  }));
}
main();
