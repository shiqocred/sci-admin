import { pgTable, text, primaryKey } from 'drizzle-orm/pg-core';
import { discounts } from './discounts';
import { products } from './products';

export const discountProducts = pgTable(
  'discount_products',
  {
    discountId: text('discount_id')
      .notNull()
      .references(() => discounts.id, { onDelete: 'cascade' }),

    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.discountId, table.productId] })]
);
