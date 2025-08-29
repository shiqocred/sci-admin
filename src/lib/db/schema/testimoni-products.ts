import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { testimonies } from "./testimonies";
import { products } from "./products";

export const testimoniProduct = pgTable(
  "testimoni_product",
  {
    testimoniId: text("testimoni_id")
      .notNull()
      .references(() => testimonies.id, { onDelete: "cascade" }),

    productId: text("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),
  },
  (t) => [
    {
      compoundPK: primaryKey({
        columns: [t.testimoniId, t.productId],
      }),
    },
  ]
);
