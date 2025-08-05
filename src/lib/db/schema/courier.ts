import { boolean, index, pgTable, text } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const couriers = pgTable(
  "courier",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    value: text("value").notNull(),
    isActive: boolean("is_active").notNull().default(false),
  },
  (table) => [index("idx_courier_is_active").on(table.isActive)]
);
