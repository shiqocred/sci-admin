import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const policies = pgTable("policy", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  privacy: text("privacy"),
  return: text("return"),
  termOfUse: text("term_of_use"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
