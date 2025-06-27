import { createId } from "@paralleldrive/cuid2";
import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { products } from "./products";

export const orderItems = pgTable("order_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, {
      onDelete: "cascade",
    }),

  productId: text("product_id").references(() => products.id, {
    onDelete: "set null",
  }),

  // --- Snapshot Fields ---
  productName: text("product_name").notNull(),
  variantGroupName: text("variant_group_name"), // contoh: "Ukuran", "Warna"
  variantItemName: text("variant_item_name").notNull(),

  sku: text("sku"),
  barcode: text("barcode"),

  initialPrice: numeric("initial_price", { precision: 12, scale: 0 }),
  unitPrice: numeric("unit_price", { precision: 12, scale: 0 }).notNull(), // harga jual saat order
  compareAtPrice: numeric("compare_at_price", { precision: 12, scale: 0 }),

  weight: numeric("weight", { precision: 10, scale: 2 }),

  quantity: integer("quantity").notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 0 }).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
