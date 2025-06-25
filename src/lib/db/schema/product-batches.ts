import { createId } from "@paralleldrive/cuid2";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { products } from "./products";

export const productBatches = pgTable("product_batches", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
  
    productId: text("product_id")
      .references(() => products.id, { onDelete: "cascade" }),
  
    quantity: integer("quantity").default(0),
    expiredDate: timestamp("expired_date"),
  
    createdAt: timestamp("created_at").defaultNow(),
  });
  