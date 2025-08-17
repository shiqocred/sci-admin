import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { bannerTypeEnum } from "./enums";

export const banners = pgTable("banner", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  image: text("image").notNull(),
  type: bannerTypeEnum("type").notNull(),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at"),
  status: boolean("status"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
