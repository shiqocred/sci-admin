// scripts/seed-couriers.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { databaseUrl } from "@/config";
import { couriers } from "../schema";

const db = drizzle(databaseUrl);

// Daftar kurir dengan nama dan value
const courierData = [
  { name: "Gojek", value: "gojek", isActive: true },
  { name: "Grab", value: "grab", isActive: true },
  { name: "Deliveree", value: "deliveree", isActive: false },
  { name: "JNE", value: "jne", isActive: true },
  { name: "TIKI", value: "tiki", isActive: true },
  { name: "Ninja", value: "ninja", isActive: true },
  { name: "Lion", value: "lion", isActive: false },
  { name: "SiCepat", value: "sicepat", isActive: true },
  { name: "Sentral Cargo", value: "sentral", isActive: false },
  { name: "J&T", value: "jnt", isActive: true },
  { name: "ID Express", value: "idexpress", isActive: false },
  { name: "RPX", value: "rpx", isActive: false },
  { name: "Wahana", value: "wahana", isActive: true },
  { name: "Pos Indonesia", value: "pos", isActive: false },
  { name: "Anteraja", value: "anteraja", isActive: true },
  { name: "SAP", value: "sap", isActive: true },
  { name: "Paxel", value: "paxel", isActive: false },
  { name: "Borzo", value: "borzo", isActive: false },
  { name: "Lalamove", value: "lalamove", isActive: false },
];

async function seedCouriers() {
  try {
    // Hapus dulu data lama (opsional)
    await db.delete(couriers);
    console.log("Old couriers deleted");

    // Insert baru
    await db.insert(couriers).values(courierData);
    console.log(
      "✅ Couriers seeded successfully:",
      courierData.map((c) => c.name)
    );
  } catch (error) {
    console.error("❌ Error seeding couriers:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedCouriers();
