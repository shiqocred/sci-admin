import { count, Table, and, SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { buildWhereClause } from "../search";
import { db } from "./client";
import { fastPagination } from "../pagination";

export async function getTotalAndPagination(
  table: Table,
  q: string,
  searchableFields: AnyPgColumn[],
  req: Request,
  extraFilter?: SQL
) {
  const searchClause = buildWhereClause(q, searchableFields);
  const where =
    searchClause && extraFilter
      ? and(searchClause, extraFilter)
      : searchClause || extraFilter;

  const totalResult = await db
    .select({ count: count() })
    .from(table)
    .where(where);
  const total = totalResult[0].count;
  const { offset, limit, pagination } = fastPagination({ req, total });

  return { where, offset, limit, pagination, total };
}
