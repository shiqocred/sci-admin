import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const about = pgTable("about", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  linkedin: text("linkedin"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  shipping_address: text("shipping_address").notNull(),
  longitude: text("longitude").notNull(),
  latitude: text("latitude").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
