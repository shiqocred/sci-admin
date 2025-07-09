import { pgEnum } from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("order_status", [
  "WAITING_PAYMENT", // Menunggu pembayaran
  "PACKING", // Dikemas
  "SHIPPING", // Dikirim
  "DELIVERED", // Selesai
  "CANCELLED", // Dibatalkan
]);

export const roleUserEnum = pgEnum("user_role", [
  "BASIC",
  "PETSHOP",
  "DOCTOR",
  "ADMIN",
]);

export const typeOtpEnum = pgEnum("type_otp", [
  "EMAIL_VERIFICATION",
  "PASSWORD_RESET",
]);

export const statusRoleEnum = pgEnum("status_role", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
