import { createId } from "@paralleldrive/cuid2";
import { numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { orderStatusEnum } from "./enums";
import { shippings } from "./shippings";
import { discounts } from "./discounts";

export const orders = pgTable("orders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  shippingId: text("shipping_id").references(() => shippings.id, {
    onDelete: "set null",
  }),

  discountId: text("discount_id").references(() => discounts.id, {
    onDelete: "set null",
  }),

  status: orderStatusEnum("status").notNull().default("WAITING_PAYMENT"),
  invoiceId: text("invoice_id"),
  totalPrice: numeric("total_price", { precision: 12, scale: 0 }).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
