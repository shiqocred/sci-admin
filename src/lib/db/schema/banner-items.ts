import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { banners } from "./banners";
import { products } from "./products";
import { pets } from "./pets";
import { suppliers } from "./suppliers";
import { promos } from "./promos";
import { categories } from "./categories";

export const bannerItems = pgTable("banner_item", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  bannerId: text("banner_id")
    .notNull()
    .references(() => banners.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id),
  petId: text("pet_id").references(() => pets.id),
  supplierId: text("supplier_id").references(() => suppliers.id),
  promoId: text("promo_id").references(() => promos.id),
  categoryId: text("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
