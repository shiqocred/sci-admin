import { numeric, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { products } from "./products";

export const productTrendings = pgTable(
  "product_trending",
  {
    productId: text("product_id").references(() => products.id, {
      onDelete: "cascade",
    }),
    position: numeric("position", { precision: 4, scale: 0 }).notNull(),
  },
  (table) => [uniqueIndex("trending_products_idx").on(table.productId)]
);
