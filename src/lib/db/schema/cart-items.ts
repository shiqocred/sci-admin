import {
  pgTable,
  text,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { carts } from "./carts";
import { productVariants } from "./product-variants";

export const cartItems = pgTable(
  "cart_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),

    variantId: text("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),

    quantity: integer("quantity").notNull().default(1),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("cart_items_unique_variant_per_cart").on(
      table.cartId,
      table.variantId
    ),
  ]
);
