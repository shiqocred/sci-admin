import {
  pgTable,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { products } from "./products";

export const productVariants = pgTable(
  "product_variants",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    name: text("name").notNull(),

    sku: text("sku").notNull(),
    barcode: text("barcode"),

    price: numeric("price", { precision: 10, scale: 0 }).notNull(),
    compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 0 }),

    stock: integer("stock").notNull().default(0),
    weight: numeric("weight", { precision: 8, scale: 0 }),

    isDefault: boolean("is_default").default(false), // optional if you want to mark a default variant

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("product_variant_sku_idx").on(table.sku),
    uniqueIndex("product_variant_barcode_idx").on(table.barcode),
  ]
);

export type InsertProductVariant = typeof productVariants.$inferInsert;
