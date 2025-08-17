import { pgTable, text, primaryKey } from "drizzle-orm/pg-core";
import { products } from "./products";
import { roleUserEnum } from "./enums";

export const productAvailableRoles = pgTable(
  "product_available_roles",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    role: roleUserEnum("role").notNull(),
  },
  (t) => [
    {
      compositePK: primaryKey({
        columns: [t.productId, t.role],
      }),
    },
  ]
);
