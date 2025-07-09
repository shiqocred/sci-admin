import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { typeOtpEnum } from "./enums";

export const verificationOtp = pgTable("verification_otp", {
  identifier: text("identifier").notNull(),
  otp: text("otp").notNull(),
  type: typeOtpEnum("type").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});
