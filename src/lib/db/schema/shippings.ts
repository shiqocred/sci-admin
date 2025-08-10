import { createId } from "@paralleldrive/cuid2";
import { numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { shippingStatusEnum } from "./enums";

export const shippings = pgTable("shippings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  address_note: text("address_note").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),

  trackingId: text("tracking_id"),
  waybillId: text("waybill_id"),
  collectionMethod: text("collection_method"),

  courierName: text("courier_name").notNull(),
  courierCompany: text("courier_company").notNull(),
  courierType: text("courier_type").notNull(),

  price: numeric("price", { precision: 12, scale: 0 }).notNull(),
  duration: text("duration").notNull(),

  status: shippingStatusEnum("status").notNull().default("PENDING"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
