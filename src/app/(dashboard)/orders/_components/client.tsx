"use client";

import { DataTable } from "@/components/data-table";
import { SortTable } from "@/components/sort-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchQuery } from "@/lib/search";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { RefreshCcw, XCircle } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";
import React, { useEffect, useMemo } from "react";
import { column } from "./columns";
import { useGetOrders } from "../_api";
import { usePagination } from "@/lib/pagination";
import Pagination from "@/components/pagination";
import { OrderFilter } from "./order-filter";

const filterField = [{ name: "Order Id", value: "id" }];

export const Client = () => {
  const [
    {
      sort,
      order,
      customer,
      status,
      minPrice,
      maxPrice,
      minProduct,
      maxProduct,
      minDate,
      maxDate,
    },
    setQuery,
  ] = useQueryStates({
    sort: parseAsString.withDefault("created"),
    order: parseAsString.withDefault("desc"),
    customer: parseAsArrayOf(parseAsString.withDefault("")).withDefault([]),
    status: parseAsArrayOf(parseAsString.withDefault("")).withDefault([]),
    minPrice: parseAsString.withDefault(""),
    maxPrice: parseAsString.withDefault(""),
    minProduct: parseAsString.withDefault(""),
    maxProduct: parseAsString.withDefault(""),
    minDate: parseAsString.withDefault(""),
    maxDate: parseAsString.withDefault(""),
  });
  const { page, metaPage, limit, setLimit, setPage, setPagination } =
    usePagination();
  const { search, searchValue, setSearch } = useSearchQuery();
  const { data, isPending, refetch, isSuccess, isRefetching } = useGetOrders({
    q: searchValue,
    p: page,
    order,
    sort,
    limit,
    userId: customer,
    status,
    minPrice,
    maxPrice,
    minProduct,
    maxProduct,
    minDate,
    maxDate,
  });

  const ordersList = useMemo(() => data?.data.data, [data]);

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data.data.pagination);
    }
  }, [isSuccess, data]);
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex items-center gap-4 justify-between">
        <h1 className="text-xl font-semibold">Orders</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center group">
            <Input
              className="h-8 focus-visible:ring-0 shadow-none w-52 placeholder:text-xs"
              placeholder="Search order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search.length > 0 && (
              <Button
                size={"icon"}
                className="absolute right-2 size-4 hover:bg-gray-200 group-hover:flex hidden"
                variant={"ghost"}
                onClick={() => setSearch(null)}
              >
                <XCircle className="size-3" />
              </Button>
            )}
          </div>
          <TooltipText value="Reload data">
            <Button
              className="size-8 flex-none disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              size={"icon"}
              onClick={() => refetch()}
              // disabled={loading}
            >
              <RefreshCcw
                className={cn("size-3.5", isRefetching && "animate-spin")}
              />
            </Button>
          </TooltipText>
          <SortTable
            order={order}
            sort={sort}
            setSort={setQuery}
            data={filterField}
            //   disabled={loading}
          />
        </div>
      </div>
      <div className="flex w-full flex-col gap-3">
        <OrderFilter
          data={data?.data.option}
          current={data?.data.current}
          query={{
            customer,
            status,
            minPrice,
            maxPrice,
            minProduct,
            maxProduct,
            minDate,
            maxDate,
          }}
          setQuery={setQuery}
        />
        <DataTable
          data={ordersList ?? []}
          columns={column({ metaPage })}
          isLoading={isPending || isRefetching}
        />
        <Pagination
          pagination={{ ...metaPage, current: page, limit }}
          setPagination={setPage}
          setLimit={setLimit}
          //   disabled={loading}
        />
      </div>
    </div>
  );
};
