import { createId } from "@paralleldrive/cuid2";
import { numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { addresses } from "./addresses";
import { discounts } from "./discounts";

export const orderDraft = pgTable("order_draft", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  discountId: text("discount_id").references(() => discounts.id, {
    onDelete: "set null",
  }),

  addressId: text("address_id").references(() => addresses.id, {
    onDelete: "cascade",
  }),

  totalWeight: numeric("total_weight", { precision: 12, scale: 0 }).notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 0 }).notNull(),
  totalDiscount: numeric("total_discount", {
    precision: 12,
    scale: 0,
  }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
