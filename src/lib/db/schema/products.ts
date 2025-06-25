import { createId } from '@paralleldrive/cuid2';
import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { categories } from './categories';
import { suppliers } from './suppliers';

export const products = pgTable('products', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),

  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  images: text('image'),

  sku: text('sku').unique(),
  barcode: text('barcode').unique(),

  initialPrice: numeric('initial_price', { precision: 12, scale: 0 }), // Harga modal (tanpa koma)
  salePrice: numeric('sale_price', { precision: 12, scale: 0 }), // Harga jual (tanpa koma)
  compareAtPrice: numeric('compare_at_price', { precision: 12, scale: 0 }), // Harga sebelum diskon

  weight: numeric('weight', { precision: 10, scale: 2 }), // gram or kg
  length: numeric('length', { precision: 10, scale: 2 }), // cm
  width: numeric('width', { precision: 10, scale: 2 }), // cm
  height: numeric('height', { precision: 10, scale: 2 }), // cm

  isActive: boolean('isActive').default(false), // cm

  categoryId: text('category_id').references(() => categories.id),
  supplierId: text('supplier_id').references(() => suppliers.id, {
    onDelete: 'set null',
  }),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
