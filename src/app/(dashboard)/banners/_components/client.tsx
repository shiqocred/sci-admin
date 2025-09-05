"use client";

import React, { useEffect, useMemo } from "react";
import { parseAsString, useQueryStates } from "nuqs";
import { Plus, RefreshCcw, XCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/pagination";
import { SortTable } from "@/components/sort-table";
import { DataTable } from "@/components/data-table";
import { TooltipText } from "@/providers/tooltip-provider";

import { cn } from "@/lib/utils";
import { column } from "./columns";
import { useSearchQuery } from "@/lib/search";
import { usePagination } from "@/lib/pagination";
import { useConfirm } from "@/hooks/use-confirm";

import { useDeleteBanner, useGetBanners, useUpdateBannerStatus } from "../_api";
import Link from "next/link";

const filterField = [{ name: "Name", value: "name" }];

export const Client = () => {
  const [{ sort, order }, setQuery] = useQueryStates({
    sort: parseAsString.withDefault("created"),
    order: parseAsString.withDefault("desc"),
  });

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Selected Banner?",
    "This action cannot be undone",
    "destructive"
  );

  const [DeactivateDialog, confirmDeactivate] = useConfirm(
    `Deactivate Selected Banner?`,
    "This banner will deactive now.",
    "destructive"
  );

  const [ActivateDialog, confirmActivate] = useConfirm(
    `Activate Selected Banner?`,
    "This banner will become active now and will have no end date.",
    "default"
  );

  const { mutate: deleteBanner, isPending: isDeleting } = useDeleteBanner();
  const { mutate: updateBanner, isPending: isUpdating } =
    useUpdateBannerStatus();

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, metaPage, limit, setLimit, setPage, setPagination } =
    usePagination();
  const { data, refetch, isRefetching, isSuccess, isPending } = useGetBanners({
    q: searchValue,
    p: page,
    limit,
    sort,
    order,
  });

  const loading = isDeleting || isRefetching || isPending || isUpdating;

  const bannersList = useMemo(() => {
    return data?.data?.data ?? [];
  }, [data]);

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteBanner({ params: { id } });
  };

  const handleUpdateStatus = async (
    status: "active" | "expired" | "scheduled",
    id: string
  ) => {
    const ok =
      status === "expired" || status === "scheduled"
        ? await confirmActivate()
        : await confirmDeactivate();
    if (!ok) return;
    updateBanner({
      body: { status: status === "expired" || status === "scheduled" },
      params: { id },
    });
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
      <div className="w-full flex items-center gap-4 justify-between">
        <h1 className="text-xl font-semibold">Banners</h1>
      </div>
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center w-full justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center group">
              <Input
                className="h-8 focus-visible:ring-0 shadow-none w-52 placeholder:text-xs"
                placeholder="Search banner..."
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
              <Link href={"/banners/create"}>
                <Plus className="size-3" />
                Add Banners
              </Link>
            </Button>
          </div>
        </div>
        <DataTable
          data={bannersList}
          columns={column({
            metaPage,
            handleDelete,
            handleUpdateStatus,
            isLoading: isDeleting || isUpdating,
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
