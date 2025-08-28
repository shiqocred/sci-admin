import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { products } from "./products";
import { promos } from "./promos";

export const promoItems = pgTable(
  "promo_item",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    promoId: text("promo_id")
      .notNull()
      .references(() => promos.id),
  },
  (table) => [
    {
      compositePK: primaryKey({
        columns: [table.productId, table.promoId],
      }),
    },
  ]
);
