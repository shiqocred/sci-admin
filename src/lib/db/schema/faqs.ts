import { pgTable, text, timestamp, index, integer } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const faqs = pgTable(
  "faq",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    question: text("question").notNull(),
    answer: text("answer").notNull(),
    position: integer("position").notNull(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("idx_faq_question").on(table.question)]
);
