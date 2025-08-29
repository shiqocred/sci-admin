import { pgTable, text } from "drizzle-orm/pg-core";
import { testimonies } from "./testimonies";

export const testimoniImage = pgTable("testimoni_image", {
  testimoniId: text("testimoni_id")
    .notNull()
    .references(() => testimonies.id, { onDelete: "cascade" }),

  url: text("url").notNull(),
});
