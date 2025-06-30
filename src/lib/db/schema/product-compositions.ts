import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { products } from "./products";

export const productCompositions = pgTable("product_compositions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  name: text("name").notNull(),

  value: text("value").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type InsertProductComposition = typeof productCompositions.$inferInsert;
