import { numeric, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { roleUserEnum } from "./enums";
import { productVariants } from "./product-variants";

export const productVariantPrices = pgTable(
  "product_variant_prices",
  {
    variantId: text("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    role: roleUserEnum("role").notNull(),
    price: numeric("price", { precision: 10, scale: 0 }).notNull(),
  },
  (t) => [
    {
      compositePK: primaryKey({
        columns: [t.variantId, t.role],
      }),
    },
  ]
);
