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
  eligibilityTypeEnum,
  minRequirementTypeEnum,
} from "./enums";

export const freeShippings = pgTable("free_shipping", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  name: text("name").notNull().unique(),

  apply: discountApplyEnum("apply").notNull(),

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

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
