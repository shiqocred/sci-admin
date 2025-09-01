import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { databaseUrl } from "@/config";
import { pets } from "../schema";

const db = drizzle(databaseUrl);

const petsData = [
  {
    name: "dogs",
    slug: "dogs-12345",
  },
  {
    name: "pets",
    slug: "pets-67890",
  },
];

export async function seedPets() {
  try {
    // Insert baru
    await db.insert(pets).values(petsData);
    console.log("✅ Pet seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding pet:", error);
  }
}
