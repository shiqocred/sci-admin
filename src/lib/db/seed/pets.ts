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

async function seedPets() {
  try {
    // Insert baru
    await db.insert(pets).values(petsData);
    console.log(
      "✅ Pet seeded successfully:",
      petsData.map((i) => i)
    );
  } catch (error) {
    console.error("❌ Error seeding pet:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedPets();
