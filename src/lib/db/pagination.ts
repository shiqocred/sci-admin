import { count, Table, and, SQL, eq, countDistinct } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { buildWhereClause } from "../search";
import { db } from "./client";
import { fastPagination } from "../pagination";
import { products, productToPets, productVariants } from "./schema";
import { NextRequest } from "next/server";

export async function getTotalAndPagination(
  table: Table,
  q: string,
  searchableFields: AnyPgColumn[],
  req: NextRequest,
  extraFilter?: SQL,
  joinPets = false,
  joinVariants = false
) {
  const searchClause = buildWhereClause(q, searchableFields);
  const where =
    searchClause && extraFilter
      ? and(searchClause, extraFilter)
      : searchClause || extraFilter;

  let total: number;

  if (joinPets || joinVariants) {
    let query: any;
    const baseQuery = db
      .select({ count: countDistinct(products.id) })
      .from(products);

    if (joinPets) {
      query = baseQuery.leftJoin(
        productToPets,
        eq(productToPets.productId, products.id)
      );
    }

    if (joinVariants) {
      query = baseQuery.leftJoin(
        productVariants,
        eq(productVariants.productId, products.id)
      );
    }

    query = baseQuery.where(where);
    const totalResult = await query;
    total = totalResult[0].count;
  } else {
    // Query normal
    const baseQuery = db.select({ count: count() }).from(table).where(where);
    const totalResult = await baseQuery;
    total = totalResult[0].count;
  }

  const { offset, limit, pagination } = fastPagination({ req, total });

  return { where, offset, limit, pagination, total };
}
