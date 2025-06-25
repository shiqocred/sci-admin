import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { roleUserEnum } from "./enums";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name"),
  email: text("email").unique(),
  password: text("password"),
  phoneNumber: text("phone_number"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: roleUserEnum("role").default("BASIC"),
});
