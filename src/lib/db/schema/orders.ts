import { createId } from '@paralleldrive/cuid2';
import { numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { orderStatusEnum } from './enums';
import { shippings } from './shippings';

export const orders = pgTable('orders', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),

  userId: text('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  shippingId: text('shipping_id')
    .unique()
    .references(() => shippings.id, {
      onDelete: 'set null',
    }),

  status: orderStatusEnum('status').notNull().default('WAITING_PAYMENT'),
  totalPrice: numeric('total_price', { precision: 12, scale: 0 }),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
