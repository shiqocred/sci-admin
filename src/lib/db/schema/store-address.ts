import { pgTable, text } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const storeAddress = pgTable("store_address", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  longitude: text("longitude").notNull(),
  latitude: text("latitude").notNull(),
});
