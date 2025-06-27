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
  if (!q || fields.length === 0) return undefined;

  const pattern = `%${q}%`;

  // Kembalikan satu ilike jika hanya satu kolom
  if (fields.length === 1) {
    return ilike(fields[0], pattern);
  }

  // Jika banyak kolom, pakai or(...)
  return or(...fields.map((field) => ilike(field, pattern)));
}
