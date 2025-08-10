import { createId } from "@paralleldrive/cuid2";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { shippings } from "./shippings";
import { shippingStatusEnum } from "./enums";

export const shippingHistories = pgTable("shipping_histories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  shippingId: text("shipping_id")
    .notNull()
    .references(() => shippings.id, {
      onDelete: "cascade",
    }),

  status: shippingStatusEnum("status").notNull().default("CONFIRMED"),
  note: text("note"),
  serviceType: text("service_type"),
  updatedAt: timestamp("updated_at"),
});
