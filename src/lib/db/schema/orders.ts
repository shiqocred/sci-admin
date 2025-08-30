import { createId } from "@paralleldrive/cuid2";
import { numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { orderStatusEnum } from "./enums";
import { discounts } from "./discounts";
import { freeShippings } from "./free-shippings";

export const orders = pgTable("orders", {
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

  freeShippingId: text("free_shipping_id").references(() => freeShippings.id, {
    onDelete: "set null",
  }),

  status: orderStatusEnum("status").notNull().default("WAITING_PAYMENT"),

  productPrice: numeric("product_price", { precision: 12, scale: 0 }).notNull(),
  shippingPrice: numeric("shipping_price", {
    precision: 12,
    scale: 0,
  }).notNull(),
  totalDiscount: numeric("total_discount", {
    precision: 12,
    scale: 0,
  }),
  totalPrice: numeric("total_price", { precision: 12, scale: 0 }).notNull(),
  note: text("note"),

  shippingAt: timestamp("shipping_at"),
  cancelledAt: timestamp("cancelled_at"),
  expiredAt: timestamp("expired_at"),
  paidAt: timestamp("paid_at"),
  deliveredAt: timestamp("delivered_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
