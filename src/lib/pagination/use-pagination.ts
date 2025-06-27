"use client";

import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { MetaPageProps } from "./type";
import { PaginationMeta } from "./fastPaginate";

export const usePagination = (
  pageParam: string = "p",
  limitParam: string = "limit"
) => {
  const [page, setPage] = useQueryState(
    pageParam,
    parseAsInteger.withDefault(1)
  );

  const [limit, setLimit] = useQueryState(
    limitParam,
    parseAsInteger.withDefault(10)
  );

  const [metaPage, setMetaPage] = useState<MetaPageProps>({
    last: 1,
    from: 0,
    total: 0,
    perPage: limit,
  });

  const setPagination = (pagination?: PaginationMeta) => {
    if (!pagination) return;

    const currentPage = pagination.currentPage ?? 1;
    const lastPage = pagination.lastPage ?? 1;
    const perPage = pagination.perPage ?? 10;

    setPage(currentPage > lastPage ? 1 : currentPage);
    setLimit(perPage);
    setMetaPage({
      last: lastPage,
      from: pagination.from ?? 0,
      total: pagination.total ?? 0,
      perPage,
    });
  };

  return {
    page,
    setPage,
    limit,
    setLimit,
    metaPage,
    setMetaPage,
    setPagination,
  };
};
