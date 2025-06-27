import { count, Table } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { buildWhereClause } from "../search";
import { db } from "./client";
import { fastPagination } from "../pagination";

export async function getTotalAndPagination(
  table: Table,
  q: string,
  searchableFields: AnyPgColumn[],
  req: Request
) {
  const where = buildWhereClause(q, searchableFields);

  const totalResult = await db
    .select({ count: count() })
    .from(table)
    .where(where);

  const total = totalResult[0].count;
  const { offset, limit, pagination } = fastPagination({ req, total });

  return { where, offset, limit, pagination, total };
}
