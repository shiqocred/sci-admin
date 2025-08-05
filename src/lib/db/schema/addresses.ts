import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";

export const addresses = pgTable(
  "address",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    phoneNumber: text("phone_number").notNull(),
    address: text("address").notNull(),
    detail: text("detail"),
    province: text("province").notNull(), // provinsi
    city: text("city").notNull(), // kabupaten
    district: text("district").notNull(), // kecamatan
    postalCode: text("postal_code").notNull(),
    longitude: text("longitude").notNull(),
    latitude: text("latitude").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  },
  (table) => [
    index("idx_address_user_id").on(table.userId),
    index("idx_address_user_id_is_default").on(table.userId, table.isDefault),
    index("idx_address_id").on(table.id),
    index("idx_address_is_default").on(table.isDefault),
  ]
);
