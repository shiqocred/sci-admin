import {
  intro,
  outro,
  multiselect,
  select,
  isCancel,
  cancel,
  spinner,
} from "@clack/prompts";
import { seedUser } from "./user";
import { seedAbout } from "./about";
import { seedCouriers } from "./couriers";
import { seedPets } from "./pets";
import { seedPolicies } from "./policies";

async function main() {
  intro("🌱 Database Seeder");

  const choice = await select({
    message: "Do you want to run:",
    options: [
      { value: "all", label: "👉 All seeders" },
      { value: "custom", label: "🎛️ Select manually" },
    ],
  });

  if (isCancel(choice)) {
    cancel("Seeder cancelled");
    process.exit(0);
  }

  let selected: string[] = [];

  if (choice === "all") {
    selected = ["user", "about", "couriers", "pets", "policies"];
  } else {
    const picks = await multiselect({
      message: "Which seeder(s) do you want to run?",
      options: [
        { value: "user", label: "User" },
        { value: "about", label: "About" },
        { value: "couriers", label: "Couriers" },
        { value: "pets", label: "Pets" },
        { value: "policies", label: "Policies" },
      ],
      required: true,
    });

    if (isCancel(picks)) {
      cancel("Seeder cancelled");
      process.exit(0);
    }

    selected = picks as string[];
  }

  // 🎬 Animasi spinner
  const s = spinner();

  try {
    if (selected.includes("user")) {
      s.start("Seeding User...");
      await seedUser();
      s.stop("✅ User seeded");
    }

    if (selected.includes("about")) {
      s.start("Seeding About...");
      await seedAbout();
      s.stop("✅ About seeded");
    }

    if (selected.includes("couriers")) {
      s.start("Seeding Couriers...");
      await seedCouriers();
      s.stop("✅ Couriers seeded");
    }

    if (selected.includes("pets")) {
      s.start("Seeding Pets...");
      await seedPets();
      s.stop("✅ Pets seeded");
    }
    if (selected.includes("policies")) {
      s.start("Seeding Policies...");
      await seedPolicies();
      s.stop("✅ Policies seeded");
    }

    outro("🎉 All selected seeders completed!");
  } catch (err) {
    s.stop("❌ Error during seeding");
    console.error(err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
