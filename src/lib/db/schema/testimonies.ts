import { createId } from "@paralleldrive/cuid2";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
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

  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});
