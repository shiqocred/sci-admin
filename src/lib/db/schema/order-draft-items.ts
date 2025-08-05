import { createId } from "@paralleldrive/cuid2";
import { index, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { productVariants } from "./product-variants";
import { orderDraft } from "./order-draft";

export const orderDraftItems = pgTable(
  "order_draft_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    orderDraftId: text("order_draft_id")
      .notNull()
      .references(() => orderDraft.id, {
        onDelete: "cascade",
      }),

    variantId: text("variant_id")
      .notNull()
      .references(() => productVariants.id, {
        onDelete: "set null",
      }),

    price: numeric("price", { precision: 12, scale: 0 }).notNull(),

    weight: numeric("weight", { precision: 10, scale: 0 }).notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 0 }).notNull(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("idx_order_draft_items_order_id").on(table.orderDraftId)]
);
