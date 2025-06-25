import { createId } from '@paralleldrive/cuid2';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { shippings } from './shippings';

export const shippingHistories = pgTable('shipping_histories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),

  shippingId: text('shipping_id')
    .notNull()
    .references(() => shippings.id, {
      onDelete: 'cascade',
    }),

  status: text('status').notNull(), // e.g. confirmed, allocated, delivered
  note: text('note'),
  serviceType: text('service_type'),
  updatedAt: timestamp('updated_at'),
});
