"use client";

import { DataTable } from "@/components/data-table";
import { SortTable } from "@/components/sort-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useSearchQuery } from "@/lib/search";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { Download, Plus, RefreshCcw, Share, XCircle } from "lucide-react";
import Link from "next/link";
import { parseAsString, useQueryStates } from "nuqs";
import React, { useEffect, useMemo } from "react";
import { column } from "./columns";
import { useGetOrders } from "../_api";
import { usePagination } from "@/lib/pagination";
import Pagination from "@/components/pagination";
import { useRouter } from "next/navigation";

const filterField = [
  { name: "Name", value: "name" },
  { name: "StocK", value: "stock" },
  { name: "Status", value: "status" },
  { name: "Category", value: "categoryName" },
  { name: "Supplier", value: "supplierName" },
  { name: "Pets", value: "petCount" },
];

export const Client = () => {
  const router = useRouter();
  const [{ sort, order }, setQuery] = useQueryStates({
    sort: parseAsString.withDefault("created"),
    order: parseAsString.withDefault("desc"),
  });
  const { page, metaPage, limit, setLimit, setPage, setPagination } =
    usePagination();
  const { search, searchValue, setSearch } = useSearchQuery();
  const { data, refetch, isSuccess, isRefetching } = useGetOrders({
    q: searchValue,
    p: page,
    order,
    sort,
    limit,
  });

  const ordersList = useMemo(() => data?.data.data, [data]);

  const handleMove = (id: string, type: "detail" | "edit") => {
    router.push(`/orders/${id}/${type === "detail" ? "detail" : "edit"}`);
  };

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data.data.pagination);
    }
  }, [isSuccess, data]);
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex items-center gap-4 justify-between">
        <h1 className="text-xl font-semibold">Reviews</h1>
        {/* <div className="flex items-center gap-2">
          <div className="flex rounded-md overflow-hidden border">
            <Button
              className="size-8 flex-none rounded-none"
              variant={"ghost"}
              size={"icon"}
              // disabled={loading}
            >
              <Share className="size-3.5" />
            </Button>
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-8"
            />
            <Button
              className="size-8 flex-none rounded-none"
              variant={"ghost"}
              size={"icon"}
              // disabled={loading}
            >
              <Download className="size-3.5" />
            </Button>
          </div>
          <Button
            className="py-0 h-8 px-3 text-xs font-medium lg:cursor-pointer"
            asChild
            //   disabled={loading}
          >
            <Link href={"/orders/create"}>
              <Plus className="size-3" />
              Add Order
            </Link>
          </Button>
        </div> */}
      </div>
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center w-full justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center group">
              <Input
                className="h-8 focus-visible:ring-0 shadow-none w-52 placeholder:text-xs"
                placeholder="Search product..."
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
        <DataTable
          data={ordersList ?? []}
          columns={column({ metaPage, handleMove })}
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
