import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const verificationOtp = pgTable("verification_otp", {
  identifier: text("identifier").notNull(),
  otp: text("otp").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});
