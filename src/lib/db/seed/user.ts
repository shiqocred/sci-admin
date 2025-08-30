import "dotenv/config";
import { userRoleDetails, users } from "../schema";
import { createId } from "@paralleldrive/cuid2";
import { drizzle } from "drizzle-orm/node-postgres";
import { databaseUrl } from "@/config";
import { InferInsertModel } from "drizzle-orm";

const db = drizzle(databaseUrl);

export async function seedUser() {
  try {
    const passHashes = await Bun.password.hash("12345678");

    const userId = createId();
    const adminId = createId();

    const userData = [
      {
        user: {
          id: userId,
          name: "user",
          email: "user@mail.com",
          password: passHashes,
          phoneNumber: "+62 8888888888",
          emailVerified: new Date(),
          role: "BASIC",
        } as InferInsertModel<typeof users>,
        detail: {
          userId,
          role: "BASIC",
          newRole: "BASIC",
        } as InferInsertModel<typeof userRoleDetails>,
      },
      {
        user: {
          id: adminId,
          name: "admin",
          email: "admin@mail.com",
          password: passHashes,
          phoneNumber: "+62 8888888888",
          emailVerified: new Date(),
          role: "ADMIN",
        } as InferInsertModel<typeof users>,
        detail: {
          userId: adminId,
          role: "ADMIN",
          newRole: "ADMIN",
        } as InferInsertModel<typeof userRoleDetails>,
      },
    ];

    for (const user of userData) {
      await db.insert(users).values(user.user);
      await db.insert(userRoleDetails).values(user.detail);
    }

    console.log("✅ user seeded successfully:", userData);
  } catch (error) {
    console.error("❌ Error seeding user:", error);
  }
}
