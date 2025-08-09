import { storeDetail } from "../schema";
import { seed } from "drizzle-seed";
import { createId } from "@paralleldrive/cuid2";
import { drizzle } from "drizzle-orm/node-postgres";
import { databaseUrl } from "@/config";

async function main() {
  const db = drizzle(databaseUrl);
  await seed(db, { storeDetail }).refine((f) => ({
    storeDetail: {
      columns: {
        id: f.default({
          defaultValue: createId(),
        }),
        name: f.default({
          defaultValue: "PT Sehat Cerah Indonesia",
        }),
        phone: f.default({
          defaultValue: "0217228383",
        }),
        address: f.default({
          defaultValue: "Jakarta",
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
