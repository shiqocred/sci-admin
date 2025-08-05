import { storeAddress } from "../schema";
import { seed } from "drizzle-seed";
import { createId } from "@paralleldrive/cuid2";
import { drizzle } from "drizzle-orm/node-postgres";
import { databaseUrl } from "@/config";

async function main() {
  const db = drizzle(databaseUrl);
  await seed(db, { storeAddress }).refine((f) => ({
    storeAddress: {
      columns: {
        id: f.default({
          defaultValue: createId(),
        }),
        latitude: f.default({
          defaultValue: "-6.175392",
        }),
        longitude: f.default({
          defaultValue: "106.827153",
        }),
      },
      count: 1,
    },
  }));
}
main();
