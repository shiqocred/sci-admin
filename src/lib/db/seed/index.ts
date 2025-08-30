import { seedUser } from "./user";
import { seedStoreDetail } from "./store-detail";
import { seedCouriers } from "./couriers";
import { seedPets } from "./pets";

async function main() {
  try {
    await seedUser();
    await seedStoreDetail();
    await seedCouriers();
    await seedPets();
    console.log("✅ All seeding completed!");
  } catch (err) {
    console.error("❌ Error while seeding:", err);
  } finally {
    process.exit(0);
  }
}

main();
