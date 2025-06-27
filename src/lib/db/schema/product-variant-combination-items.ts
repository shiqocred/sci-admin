import { createId } from "@paralleldrive/cuid2";
import { index, pgTable, text } from "drizzle-orm/pg-core";
import { productVariantCombinations } from "./product-variant-combinations";
import { productVariantItems } from "./product-variant-items";

export const productVariantCombinationItems = pgTable(
  "product_variant_combination_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    combinationId: text("combination_id").references(
      () => productVariantCombinations.id,
      {
        onDelete: "cascade",
      }
    ),
    variantItemId: text("variant_item_id").references(
      () => productVariantItems.id,
      {
        onDelete: "cascade",
      }
    ),
  },
  (table) => [
    index("combo_items_combination_idx").on(table.combinationId),
    index("combo_items_variant_item_idx").on(table.variantItemId),
  ]
);
