import { createId } from "@paralleldrive/cuid2";
import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { users } from "./users";

export const testimonies = pgTable("testimonies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  orderId: text("order_id")
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "cascade" }),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  rating: numeric("rating", { precision: 10, scale: 0 }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isActive: boolean("is_active").notNull().default(false),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});
