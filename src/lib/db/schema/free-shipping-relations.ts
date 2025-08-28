import { pgTable, text } from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { suppliers } from "./suppliers";
import { pets } from "./pets"; // pastikan pets sudah dibuat
import { users } from "./users";
import { roleUserEnum } from "./enums";
import { productVariants } from "./product-variants";
import { freeShippings } from "./free-shippings";

export const freeShippingApplies = pgTable("free_shipping_apply", {
  freeShippingId: text("free_shipping_id")
    .notNull()
    .references(() => freeShippings.id, {
      onDelete: "cascade",
    }),
  variantId: text("variant_id").references(() => productVariants.id, {
    onDelete: "cascade",
  }),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "cascade",
  }),
  supplierId: text("supplier_id").references(() => suppliers.id, {
    onDelete: "cascade",
  }),
  petId: text("pet_id").references(() => pets.id, { onDelete: "cascade" }),
});

export const freeShippingEligibilities = pgTable("free_shipping_eligibility", {
  freeShippingId: text("free_shipping_id")
    .notNull()
    .references(() => freeShippings.id, { onDelete: "cascade" }),
  role: roleUserEnum("role"),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
});
