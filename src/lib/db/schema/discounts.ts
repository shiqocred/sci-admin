import {
  pgTable,
  text,
  boolean,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import {
  discountApplyEnum,
  discountValueTypeEnum,
  eligibilityTypeEnum,
  minRequirementTypeEnum,
} from "./enums";

export const discounts = pgTable("discounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  code: text("code").notNull(),

  apply: discountApplyEnum("apply").notNull(),
  valueType: discountValueTypeEnum("value_type").notNull(), // fixed / percentage
  value: numeric("value", { precision: 10, scale: 0 }).notNull(),

  // Minimum requirement
  minimumType: minRequirementTypeEnum("minimum_type"),
  eligibilityType: eligibilityTypeEnum("eligibility_type"),
  minimum: numeric("minimum", { precision: 10, scale: 0 }),

  // Voucher limitation (optional if type === "VOUCHER")
  maxTotalUse: numeric("max_total_use", { precision: 10, scale: 0 }),
  maxUserOnce: boolean("max_user_once"),

  // Dates
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at"),
  isActive: boolean("active"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
