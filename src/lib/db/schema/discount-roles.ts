import { pgTable, text, primaryKey } from 'drizzle-orm/pg-core';
import { discounts } from './discounts';
import { roleUserEnum } from './enums';

export const discountRoles = pgTable(
  'discount_roles',
  {
    discountId: text('discount_id')
      .notNull()
      .references(() => discounts.id, { onDelete: 'cascade' }),

    role: roleUserEnum('role').notNull(),
  },
  (table) => [primaryKey({ columns: [table.discountId, table.role] })]
);
