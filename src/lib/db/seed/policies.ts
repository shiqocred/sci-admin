import "dotenv/config";
import { policies } from "../schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { databaseUrl } from "@/config";

const db = drizzle(databaseUrl);

export async function seedPolicies() {
  try {
    await db.delete(policies);
    console.log("✅ Policies detail deleted");

    // Insert baru
    await db.insert(policies).values({
      privacy: null,
      return: null,
      termOfUse: null,
    });
    console.log("✅ Policies seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding store detail:", error);
  }
}
