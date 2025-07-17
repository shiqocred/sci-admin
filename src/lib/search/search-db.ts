import { ilike, or, SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

/**
 * Membuat where clause untuk pencarian menggunakan ILIKE pada banyak kolom.
 *
 * @param q Query string yang ingin dicari
 * @param fields Array kolom yang dicari (harus kolom teks)
 * @returns SQL expression atau undefined jika q kosong
 */
export function buildWhereClause(
  q: string,
  fields: AnyPgColumn[]
): SQL | undefined {
  const trimmed = q.trim();
  if (!trimmed || fields.length === 0) return undefined;

  const pattern = `%${trimmed}%`;

  return fields.length === 1
    ? ilike(fields[0], pattern)
    : or(...fields.map((field) => ilike(field, pattern)));
}
