import { createId } from "@paralleldrive/cuid2";
import { index, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { productVariants } from "./product-variants";

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, {
        onDelete: "cascade",
      }),

    variantId: text("variant_id")
      .notNull()
      .references(() => productVariants.id, {
        onDelete: "set null",
      }),

    price: numeric("price", { precision: 12, scale: 0 }).notNull(),

    weight: numeric("weight", { precision: 10, scale: 0 }).notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 0 }).notNull(),

    discountPrice: numeric("discount_price", { precision: 12, scale: 0 })
      .default("0")
      .notNull(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("idx_order_items_order_id").on(table.orderId)]
);
