import { createId } from "@paralleldrive/cuid2";
import { index, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { addresses } from "./addresses";
import { orderDraftStatusEnum } from "./enums";

export const orderDraft = pgTable(
  "order_draft",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    addressId: text("address_id").references(() => addresses.id, {
      onDelete: "cascade",
    }),

    totalWeight: numeric("total_weight", { precision: 12, scale: 0 }).notNull(),
    totalPrice: numeric("total_price", { precision: 12, scale: 0 }).notNull(),
    status: orderDraftStatusEnum("status").notNull().default("ACTIVE"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_order_draft_user_status").on(table.userId, table.status),
  ]
);
