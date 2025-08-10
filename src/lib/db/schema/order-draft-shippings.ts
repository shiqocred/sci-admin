import { createId } from "@paralleldrive/cuid2";
import { index, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { orderDraft } from "./order-draft";
import { durationTypeEnum, orderDraftShippingsEnum } from "./enums";
import { addresses } from "./addresses";
import { users } from "./users";

export const orderDraftShippings = pgTable(
  "order_draft_shippings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    orderDraftId: text("order_draft_id")
      .notNull()
      .references(() => orderDraft.id, {
        onDelete: "cascade",
      }),

    addressId: text("address_id")
      .notNull()
      .references(() => addresses.id, {
        onDelete: "cascade",
      }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    price: numeric("price", { precision: 12, scale: 0 }).notNull(),

    name: orderDraftShippingsEnum("name").notNull(),
    label: text("label").notNull(),
    company: text("company").notNull(),
    type: text("type").notNull(),
    fastestEstimate: timestamp("fastest_estimate").notNull(),
    longestEstimate: timestamp("longest_estimate").notNull(),
    duration: durationTypeEnum("duration").notNull().default("DAY"),
    weight: text("weight").notNull(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_order_draft_shippings_order_id").on(table.orderDraftId),
    index("idx_order_draft_addr_weight").on(
      table.orderDraftId,
      table.addressId,
      table.weight
    ),
  ]
);
