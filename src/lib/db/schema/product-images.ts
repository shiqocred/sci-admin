import { createId } from "@paralleldrive/cuid2";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { products } from "./products";

export const productImages = pgTable(
  "product_images",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text("product_id").references(() => products.id, {
      onDelete: "cascade",
    }),
    url: text("url").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("product_images_product_idx").on(table.productId)]
);
