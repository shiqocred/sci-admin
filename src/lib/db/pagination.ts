import { count, Table, and, SQL, eq, countDistinct } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { buildWhereClause } from "../search";
import { db } from "./client";
import { fastPagination } from "../pagination";
import { products, productToPets } from "./schema";
import { NextRequest } from "next/server";

export async function getTotalAndPagination(
  table: Table,
  q: string,
  searchableFields: AnyPgColumn[],
  req: NextRequest,
  extraFilter?: SQL,
  joinPets = false
) {
  const searchClause = buildWhereClause(q, searchableFields);
  const where =
    searchClause && extraFilter
      ? and(searchClause, extraFilter)
      : searchClause || extraFilter;

  const baseQuery = db.select({ count: count() }).from(table);

  const totalResult = await baseQuery.where(where);

  let total: number;

  total = totalResult[0].count;

  if (joinPets) {
    const baseQueryA = db
      .select({ count: countDistinct(products.id) })
      .from(products);
    baseQueryA.leftJoin(
      productToPets,
      eq(productToPets.productId, products.id)
    );

    const totalResultA = await baseQueryA.where(where);

    total = totalResultA[0].count;
  }

  console.log("Total products:", total);

  const { offset, limit, pagination } = fastPagination({ req, total });

  return { where, offset, limit, pagination, total };
}
