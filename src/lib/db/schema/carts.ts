import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";
import { productVariants } from "./product-variants";

export const carts = pgTable("cart", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // unique cart per user
  variantId: text("variant_id")
    .notNull()
    .references(() => productVariants.id),
  quantity: numeric("quantity", { precision: 8, scale: 0 }).notNull(),
  checked: boolean("checked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
