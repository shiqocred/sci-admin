import { pgEnum } from 'drizzle-orm/pg-core';

export const orderStatusEnum = pgEnum('order_status', [
  'WAITING_PAYMENT', // Menunggu pembayaran
  'PACKING', // Dikemas
  'SHIPPING', // Dikirim
  'DELIVERED', // Selesai
  'CANCELLED', // Dibatalkan
]);

export const roleUserEnum = pgEnum('userRole', [
  'BASIC',
  'PETSHOP',
  'DOCTOR',
  'ADMIN',
]);
