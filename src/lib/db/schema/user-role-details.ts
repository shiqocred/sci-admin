import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { roleUserEnum, statusRoleEnum, typeIdEnum } from "./enums";

export const userRoleDetails = pgTable("user_role_details", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  role: roleUserEnum("role").default("BASIC").notNull(),
  newRole: roleUserEnum("new_role").default("BASIC").notNull(),

  personalIdType: typeIdEnum("personal_id_type"),
  personalIdFile: text("personal_id_file"),
  veterinarianIdFile: text("veterinarian_id_file"),
  storefrontFile: text("storefront_file"),

  personalId: text("personal_id"),
  veterinarianId: text("veterinarian_id"),
  fullName: text("full_name"),

  message: text("message"),
  status: statusRoleEnum("status"),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});
