import { createId } from "@paralleldrive/cuid2";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { suppliers } from "./suppliers";

export const products = pgTable(
  "products",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description"),
    indication: text("indication"),
    dosageUsage: text("dosage_usage"),
    storageInstruction: text("storage_instruction"),
    packaging: text("packaging"),
    registrationNumber: text("registration_number"),
    status: boolean("status").default(false),
    categoryId: text("category_id").references(() => categories.id),
    supplierId: text("supplier_id").references(() => suppliers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [uniqueIndex("products_slug_idx").on(table.slug)]
);
