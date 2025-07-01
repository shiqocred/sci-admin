import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { products } from "./products";
import { pets } from "./pets";

export const productToPets = pgTable(
  "product_to_pets",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    petId: text("pet_id")
      .notNull()
      .references(() => pets.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.productId, table.petId] })]
);
