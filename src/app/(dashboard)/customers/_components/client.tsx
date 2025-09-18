"use client";

import React, { useEffect, useMemo } from "react";
import { useGetCustomers } from "../_api/query/use-get-customers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCcw, XCircle } from "lucide-react";
import { TooltipText } from "@/providers/tooltip-provider";
import { SortTable } from "@/components/sort-table";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { column } from "./columns";
import { useSearchQuery } from "@/lib/search";
import { usePagination } from "@/lib/pagination";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { SheetRole } from "./dialogs/sheet-role";
import { CustomerFilter } from "./customer-filter";

const filterField = [
  { name: "Name", value: "name" },
  { name: "Email", value: "email" },
  { name: "Orders", value: "orders" },
  { name: "Amount Spent", value: "spent" },
];

export const Client = () => {
  const [
    {
      sort,
      order,
      dialog,
      customerId,
      role,
      minOrder,
      maxOrder,
      minSpent,
      maxSpent,
      email,
      approve,
    },
    setQuery,
  ] = useQueryStates(
    {
      sort: parseAsString.withDefault("created"),
      order: parseAsString.withDefault("desc"),
      dialog: parseAsString.withDefault(""),
      customerId: parseAsString.withDefault(""),
      role: parseAsArrayOf(parseAsString.withDefault("")).withDefault([]),
      minOrder: parseAsString.withDefault(""),
      maxOrder: parseAsString.withDefault(""),
      minSpent: parseAsString.withDefault(""),
      maxSpent: parseAsString.withDefault(""),
      email: parseAsString.withDefault(""),
      approve: parseAsBoolean.withDefault(false),
    },
    {
      urlKeys: {
        customerId: "id",
      },
    }
  );

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, metaPage, limit, setLimit, setPage, setPagination } =
    usePagination();
  const { data, refetch, isRefetching, isSuccess, isPending } = useGetCustomers(
    {
      q: searchValue,
      p: page,
      limit,
      sort,
      order,
      role,
      status: email,
      approval: approve,
      minOrder,
      maxOrder,
      minSpent,
      maxSpent,
    }
  );

  const loading = isRefetching || isPending;

  const customersList = useMemo(() => {
    return data?.data?.data ?? [];
  }, [data]);

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data.data.pagination);
    }
  }, [isSuccess, data]);

  return (
    <div className="w-full flex flex-col gap-6">
      <SheetRole
        open={dialog === "review"}
        onOpenChange={() => {
          setQuery({ dialog: null, customerId: null });
        }}
        id={customerId}
      />
      <div className="w-full flex items-center gap-4 justify-between">
        <h1 className="text-xl font-semibold">Customers</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center group">
            <Input
              className="h-8 focus-visible:ring-0 shadow-none w-52 placeholder:text-xs"
              placeholder="Search customer..."
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
              disabled={loading}
            >
              <RefreshCcw
                className={cn("size-3.5", loading && "animate-spin")}
              />
            </Button>
          </TooltipText>
          <SortTable
            order={order}
            sort={sort}
            setSort={setQuery}
            data={filterField}
          />
        </div>
      </div>
      <div className="flex w-full flex-col gap-3">
        {data?.data.option && (
          <CustomerFilter
            query={{
              role,
              email,
              minOrder,
              maxOrder,
              minSpent,
              maxSpent,
              approve,
            }}
            setQuery={setQuery}
            data={data?.data.option}
            current={data?.data.current}
          />
        )}

        <DataTable
          data={customersList}
          columns={column({ metaPage, setQuery })}
          isLoading={isPending}
        />
        <Pagination
          pagination={{ ...metaPage, current: page, limit }}
          setPagination={setPage}
          setLimit={setLimit}
        />
      </div>
    </div>
  );
};
