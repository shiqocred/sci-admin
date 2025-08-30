import "dotenv/config";
import { storeDetail } from "../schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { databaseUrl } from "@/config";

const db = drizzle(databaseUrl);

// Daftar kurir dengan nama dan value
const storeDetailData = {
  name: "PT Sehat Cerah Indonesia",
  phone: "0217228383",
  address: "Jakarta",
  latitude: "-6.175392",
  longitude: "106.827153",
};

export async function seedStoreDetail() {
  try {
    // Hapus dulu data lama (opsional)
    await db.delete(storeDetail);
    console.log("✅ Old store detail deleted");

    // Insert baru
    await db.insert(storeDetail).values(storeDetailData);
    console.log("✅ Store detail seeded successfully:", storeDetailData);
  } catch (error) {
    console.error("❌ Error seeding store detail:", error);
  }
}
