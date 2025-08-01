import { pgTable, text } from "drizzle-orm/pg-core";
import { discounts } from "./discounts";
import { categories } from "./categories";
import { suppliers } from "./suppliers";
import { pets } from "./pets"; // pastikan pets sudah dibuat
import { users } from "./users";
import { roleUserEnum } from "./enums";
import { productVariants } from "./product-variants";

export const discountProductVariants = pgTable("discount_product_variants", {
  discountId: text("discount_id")
    .notNull()
    .references(() => discounts.id, {
      onDelete: "cascade",
    }),
  variantId: text("variant_id")
    .notNull()
    .references(() => productVariants.id, {
      onDelete: "cascade",
    }),
});

export const discountCategories = pgTable("discount_categories", {
  discountId: text("discount_id")
    .notNull()
    .references(() => discounts.id, {
      onDelete: "cascade",
    }),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, {
      onDelete: "cascade",
    }),
});

export const discountSuppliers = pgTable("discount_suppliers", {
  discountId: text("discount_id")
    .notNull()
    .references(() => discounts.id, {
      onDelete: "cascade",
    }),
  supplierId: text("supplier_id")
    .notNull()
    .references(() => suppliers.id, {
      onDelete: "cascade",
    }),
});

export const discountPets = pgTable("discount_pets", {
  discountId: text("discount_id")
    .notNull()
    .references(() => discounts.id, {
      onDelete: "cascade",
    }),
  petId: text("pet_id")
    .notNull()
    .references(() => pets.id, { onDelete: "cascade" }),
});

export const discountToRoles = pgTable("discount_to_roles", {
  discountId: text("discount_id")
    .notNull()
    .references(() => discounts.id, { onDelete: "cascade" }),
  role: roleUserEnum("role").notNull(),
});

export const discountUsers = pgTable("discount_users", {
  discountId: text("discount_id")
    .notNull()
    .references(() => discounts.id, {
      onDelete: "cascade",
    }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // cocokkan dengan sistem user kamu
});
