import { createId } from '@paralleldrive/cuid2';
import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const shippings = pgTable('shippings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),

  waybillId: text('waybill_id').unique().notNull(), // untuk cek tracking
  courierCompany: text('courier_company').notNull(), // grab, jne, etc

  // Courier dari Biteship
  courierDriverName: text('courier_driver_name'),
  courierDriverPhone: text('courier_driver_phone'),
  courierDriverPlate: text('courier_driver_plate'),
  courierDriverPhotoUrl: text('courier_driver_photo_url'),

  destinationAddress: text('destination_address'),

  trackingLink: text('tracking_link'),
  orderRefId: text('order_ref_id'), // order_id dari Biteship

  shippingCost: numeric('shipping_cost', { precision: 12, scale: 0 }),
  estimatedDay: integer('estimated_day'),
  status: text('status').default('WAITING'), // delivered, etc

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
