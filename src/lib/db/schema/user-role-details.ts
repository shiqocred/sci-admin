import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { roleUserEnum, statusRoleEnum } from "./enums";

export const userRoleDetails = pgTable("user_role_details", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  role: roleUserEnum("role").default("BASIC").notNull(),
  newRole: roleUserEnum("new_role").default("BASIC").notNull(),

  fileKtp: text("file_ktp"),
  fileKta: text("file_kta"),
  storefront: text("file_storefront"),

  nik: text("nik"),
  noKta: text("no_kta"),
  name: text("name"),

  message: text("message"),
  status: statusRoleEnum("status"),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});
