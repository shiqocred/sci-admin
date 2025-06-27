import { createId } from "@paralleldrive/cuid2";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { carts } from "./carts";
import { products } from "./products";
import { productVariantCombinations } from "./product-variant-combinations";

export const cartItems = pgTable(
  "cart_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    variantCombinationId: text("variant_combination_id").references(
      () => productVariantCombinations.id,
      { onDelete: "set null" }
    ),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("cart_items_cart_idx").on(table.cartId),
    index("cart_items_product_idx").on(table.productId),
    index("cart_items_variant_combination_idx").on(table.variantCombinationId),
  ]
);
