import { createId } from '@paralleldrive/cuid2';
import { integer, numeric, pgTable, text } from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { products } from './products';

export const orderItems = pgTable('order_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),

  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, {
      onDelete: 'cascade',
    }),

  productId: text('product_id')
    .notNull()
    .references(() => products.id, {
      onDelete: 'set null',
    }),

  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 0 }), // harga satuan saat order

  totalPrice: numeric('total_price', { precision: 12, scale: 0 }),
});
