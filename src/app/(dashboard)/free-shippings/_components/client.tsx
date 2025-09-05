"use client";

import React, { useEffect, useMemo } from "react";
import { useGetFreeShippings } from "../_api/query/use-get-free-shippings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw, XCircle } from "lucide-react";
import { TooltipText } from "@/providers/tooltip-provider";
import { SortTable } from "@/components/sort-table";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { column } from "./columns";
import { useSearchQuery } from "@/lib/search";
import { usePagination } from "@/lib/pagination";
import { parseAsString, useQueryStates } from "nuqs";
import Link from "next/link";
import { useDeleteFreeShipping, useUpdateFreeShippingStatus } from "../_api";
import { useConfirm } from "@/hooks/use-confirm";

export interface InputProps {
  name: string;
  selected: string[];
  role: string[];
  userId: string[];
  purchase: string;
  quantity: string;
  use: string;
  startTime: string;
  endTime: string;
}

const filterField = [{ name: "Name", value: "name" }];

export const Client = () => {
  const [{ sort, order }, setQuery] = useQueryStates({
    sort: parseAsString.withDefault("created"),
    order: parseAsString.withDefault("desc"),
  });

  const [DeleteDialog, confirmDelete] = useConfirm(
    `Delete Selected Free Shipping?`,
    "This action cannot be undone",
    "destructive"
  );

  const [DeactivateDialog, confirmDeactivate] = useConfirm(
    `Deactivate Selected Free Shipping?`,
    "This free shipping will expire now.",
    "destructive"
  );

  const [ActivateDialog, confirmActivate] = useConfirm(
    `Activate Selected Free Shipping?`,
    "This free shipping will become active now and will have no end date.",
    "default"
  );

  const { mutate: deleteDiscount, isPending: isDeleting } =
    useDeleteFreeShipping();
  const { mutate: updateDiscountStatus, isPending: isUpdatingStatus } =
    useUpdateFreeShippingStatus();

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, metaPage, limit, setLimit, setPage, setPagination } =
    usePagination();
  const { data, refetch, isRefetching, isSuccess, isPending } =
    useGetFreeShippings({
      q: searchValue,
      p: page,
      limit,
      sort,
      order,
    });

  const loading = isRefetching || isPending || isDeleting || isUpdatingStatus;

  const freeShippingList = useMemo(() => {
    return data?.data?.data ?? [];
  }, [data]);

  const handleUpdateStatus = async (
    status: "active" | "expired" | "scheduled",
    id: string
  ) => {
    const ok =
      status === "expired" || status === "scheduled"
        ? await confirmActivate()
        : await confirmDeactivate();
    if (!ok) return;
    updateDiscountStatus({
      body: { status: status === "expired" || status === "scheduled" },
      params: { id },
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteDiscount({ params: { id } });
  };

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data.data.pagination);
    }
  }, [isSuccess, data]);

  return (
    <div className="w-full flex flex-col gap-6">
      <DeleteDialog />
      <DeactivateDialog />
      <ActivateDialog />
      <div className="w-full flex items-center gap-2">
        <h1 className="text-xl font-semibold">Free Shippings</h1>
      </div>
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center w-full justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center group">
              <Input
                className="h-8 focus-visible:ring-0 shadow-none w-52 placeholder:text-xs"
                placeholder="Search free shipping..."
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
          </div>
          <div className="flex items-center gap-2">
            <SortTable
              order={order}
              sort={sort}
              setSort={setQuery}
              data={filterField}
            />
            {/* <div className="flex rounded-md overflow-hidden border">
              <TooltipText value="Export">
                <Button
                  className="size-8 flex-none rounded-none"
                  variant={"ghost"}
                  size={"icon"}
                >
                  <Share className="size-3.5" />
                </Button>
              </TooltipText>
              <Separator
                orientation="vertical"
                className="data-[orientation=vertical]:h-8"
              />
              <TooltipText value="Import">
                <Button
                  className="size-8 flex-none rounded-none"
                  variant={"ghost"}
                  size={"icon"}
                >
                  <Download className="size-3.5" />
                </Button>
              </TooltipText>
            </div> */}
            <Button
              className="py-0 h-8 px-3 text-xs font-medium lg:cursor-pointer"
              disabled={loading}
              asChild
            >
              <Link href={"/free-shippings/create"}>
                <Plus className="size-3" />
                Add Free Shipping
              </Link>
            </Button>
          </div>
        </div>
        <DataTable
          data={freeShippingList}
          columns={column({
            metaPage,
            handleUpdateStatus,
            handleDelete,
            disabled: isDeleting || isUpdatingStatus,
          })}
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
