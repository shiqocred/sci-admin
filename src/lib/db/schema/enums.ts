import { pgEnum } from "drizzle-orm/pg-core";

export const orderDraftShippingsEnum = pgEnum("order_draft_shipping_enum", [
  "EXPRESS",
  "REGULAR",
  "ECONOMY",
]);

export const orderDraftStatusEnum = pgEnum("order_draft_status_enum", [
  "ACTIVE",
  "EXPIRED",
  "ABANDONED",
  "CHECKOUTED",
]);

export const roleUserEnum = pgEnum("user_role", [
  "BASIC",
  "PETSHOP",
  "VETERINARIAN",
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

export const discountApplyEnum = pgEnum("apply_type", [
  "categories",
  "suppliers",
  "pets",
  "products",
]);
export const discountValueTypeEnum = pgEnum("discount_value_type", [
  "percentage",
  "fixed",
]);
export const minRequirementTypeEnum = pgEnum("min_requirement_type", [
  "amount",
  "quantity",
]);
export const eligibilityTypeEnum = pgEnum("eligibility_type", ["user", "role"]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "EXPIRED",
  "CANCELLED",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "WAITING_PAYMENT", // Menunggu pembayaran
  "PACKING", // Dikemas
  "SHIPPING", // Dikirim
  "DELIVERED", // Selesai
  "EXPIRED", // Selesai
  "CANCELLED", // Dibatalkan
]);

export const shippingStatusEnum = pgEnum("shipping_status", [
  "CONFIRMED",
  "SCHEDULED",
  "ALLOCATED",
  "PICKING_UP",
  "PICKED",
  "CANCELLED",
  "ON_HOLD",
  "DROPPING_OFF",
  "RETURN_IN_TRANSIT",
  "RETURNED",
  "REJECTED",
  "DISPOSED",
  "COURIER_NOT_FOUND",
  "DELIVERED",
  "PENDING",
]);
export const durationTypeEnum = pgEnum("duration_type", ["HOUR", "DAY"]);
export const bannerTypeEnum = pgEnum("banner_type", [
  "DETAIL",
  "PETS",
  "PROMOS",
  "SUPPLIERS",
  "CATEGORIES",
]);
export const typeIdEnum = pgEnum("type_id_enum", ["NIK", "NIB", "NPWP"]);
