import { NextRequest } from "next/server";

export type PaginationMeta = {
  firstPage: number;
  lastPage: number;
  currentPage: number;
  from: number;
  last: number;
  total: number;
  perPage: number;
};

type PaginationOptions = {
  req: NextRequest;
  total: number;
  pageParamName?: string;
  limitParamName?: string;
};

export function fastPagination({
  req,
  total,
  pageParamName = "p",
  limitParamName = "limit",
}: PaginationOptions): {
  pagination: PaginationMeta;
  offset: number;
  limit: number;
} {
  const url = req.nextUrl;

  let page = Number.parseInt(url.searchParams.get(pageParamName) ?? "1", 10);
  let limit = Number.parseInt(url.searchParams.get(limitParamName) ?? "10", 10);

  // ✅ Validasi untuk menghindari NaN atau nilai tidak valid
  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(limit) || limit < 1) limit = 10;

  const offset = (page - 1) * limit;
  const lastPage = Math.max(Math.ceil(total / limit), 1);
  const from = total === 0 ? 0 : offset + 1;
  const last = Math.min(offset + limit, total);

  return {
    offset,
    limit,
    pagination: {
      firstPage: 1,
      lastPage,
      currentPage: page,
      from,
      last,
      total,
      perPage: limit,
    },
  };
}
