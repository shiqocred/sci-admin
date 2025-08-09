import { pgTable, text } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const storeDetail = pgTable("store_detail", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  longitude: text("longitude").notNull(),
  latitude: text("latitude").notNull(),
});
