import "dotenv/config";
import { about } from "../schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { databaseUrl } from "@/config";

const db = drizzle(databaseUrl);

const aboutData = {
  name: "PT Sehat Cerah Indonesia",
  phone: "0217228383",
  latitude: "-6.175392",
  longitude: "106.827153",
  address:
    "Jl. RS Fatmawati No. 39, Komplek Duta Mas Fatmawati Blok A1 No. 30 - 32, Cipete Utara, Kebayoran Baru, Jakarta Selatan, 12150",
  whatsapp: "8888888888",
  message: "Hallo SCI",
  linkedin: "https://www.linkedin.com/company/sehatcerahid",
  instagram: "https://www.instagram.com/sci_sehatcerahid",
  facebook: "https://web.facebook.com/sehatcerahindonesia",
};

export async function seedAbout() {
  try {
    await db.delete(about);
    console.log("✅ Old store detail deleted");

    // Insert baru
    await db.insert(about).values(aboutData);
    console.log("✅ Store detail seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding store detail:", error);
  }
}
