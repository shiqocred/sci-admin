import { createId } from '@paralleldrive/cuid2';
import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const discounts = pgTable('discounts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),

  name: text('name'), // nama promosi
  type: text('type'), // "product" | "voucher"
  code: text('code'), // hanya diisi jika type = "voucher"

  percentage: integer('percentage'), // diskon dalam persen, misal: 10 = 10%
  minPurchase: numeric('min_purchase', { precision: 12, scale: 0 }), // minimal pembelian

  startsAt: timestamp('starts_at'),
  endsAt: timestamp('ends_at'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
