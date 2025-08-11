import { createId } from "@paralleldrive/cuid2";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { paymentStatusEnum } from "./enums";

export const invoices = pgTable("invoice", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  paymentId: text("payment_id"),
  paymentChannel: text("payment_channel"), // grab, jne, etc
  paymentMethod: text("payment_method"), // grab, jne, etc
  amount: text("amount").notNull(), // grab, jne, etc
  status: paymentStatusEnum("status").notNull().default("PENDING"),

  expiredAt: timestamp("expired_at"),
  paidAt: timestamp("paid_at"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
