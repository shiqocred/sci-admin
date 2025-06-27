import { createId } from "@paralleldrive/cuid2";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { productVariants } from "./product-variants";

export const productVariantItems = pgTable(
  "product_variant_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    productVariantId: text("product_variant_id").references(
      () => productVariants.id,
      {
        onDelete: "cascade",
      }
    ),
    name: text("name").notNull(),
    image: text("image"), // Untuk thumbnail warna misalnya
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("variant_items_variant_idx").on(table.productVariantId)]
);
