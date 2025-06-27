import { createId } from "@paralleldrive/cuid2";
import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { products } from "./products";

export const productVariantCombinations = pgTable(
  "product_variant_combinations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),
    sku: text("sku").unique(),
    barcode: text("barcode").unique(), // Jika barcode dipakai per varian tunggal
    quantity: integer("quantity").notNull().default(0),
    salePrice: numeric("sale_price", { precision: 12, scale: 0 }),
    compareAtPrice: numeric("compare_at_price", { precision: 12, scale: 0 }),
    weight: numeric("weight", { precision: 10, scale: 2 }),
    image: text("image"), // Jika gambar per kombinasi diperlukan
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("combinations_product_idx").on(table.productId)]
);
