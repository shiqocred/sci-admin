import { index, numeric, pgTable, text } from "drizzle-orm/pg-core";
import { products } from "./products";

export const productImages = pgTable(
  "product_images",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),
    url: text("url").notNull(),
    position: numeric("position", { precision: 10, scale: 0 }).notNull(),
  },
  (table) => [index("product_images_product_idx").on(table.productId)]
);
