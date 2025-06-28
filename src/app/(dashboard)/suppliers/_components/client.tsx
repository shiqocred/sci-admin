"use client";

import React, { useEffect, useMemo } from "react";
import { parseAsString, useQueryStates } from "nuqs";
import { Download, Plus, RefreshCcw, Share, XCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/pagination";
import { SortTable } from "@/components/sort-table";
import { DataTable } from "@/components/data-table";
import { Separator } from "@/components/ui/separator";
import { TooltipText } from "@/providers/tooltip-provider";
import { CreateEditDialog } from "./dialog/create-edit-dialog";

import { cn } from "@/lib/utils";
import { column } from "./columns";
import { useSearchQuery } from "@/lib/search";
import { usePagination } from "@/lib/pagination";
import { useConfirm } from "@/hooks/use-confirm";

import { useDeleteSupplier, useGetSuppliers } from "../_api";

const filterField = [
  { name: "Name", value: "name" },
  { name: "Slug", value: "slug" },
  { name: "Products", value: "products" },
];

export const Client = () => {
  const [{ dialog, supplierId, sort, order }, setQuery] = useQueryStates(
    {
      dialog: parseAsString.withDefault(""),
      supplierId: parseAsString.withDefault(""),
      sort: parseAsString.withDefault("created"),
      order: parseAsString.withDefault("desc"),
    },
    {
      urlKeys: {
        supplierId: "id",
      },
    }
  );

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Supplier",
    "This action cannot be undone",
    "destructive"
  );

  const { mutate: deleteSupplier, isPending: isDeleting } = useDeleteSupplier();

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, metaPage, limit, setLimit, setPage, setPagination } =
    usePagination();
  const { data, refetch, isRefetching, isSuccess, isPending } = useGetSuppliers(
    {
      q: searchValue,
      p: page,
      limit,
      sort,
      order,
    }
  );

  const loading = isDeleting || isRefetching || isPending;

  const categoriesList = useMemo(() => {
    return data?.data?.data ?? [];
  }, [data]);

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteSupplier({ params: { id } });
  };

  useEffect(() => {
    if (supplierId && (!dialog || dialog === null)) {
      setQuery({ dialog: null });
    }
  }, [supplierId, dialog]);

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data.data.pagination);
    }
  }, [isSuccess, data]);
  return (
    <div className="w-full flex flex-col gap-6">
      <DeleteDialog />
      <CreateEditDialog
        open={dialog === "create" || dialog === "edit"}
        onOpenChange={() => {
          setQuery({ supplierId: null, dialog: null });
        }}
        supplierId={supplierId}
      />
      <div className="w-full flex items-center gap-4 justify-between">
        <h1 className="text-xl font-semibold">Suppliers</h1>
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
            <div className="flex rounded-md overflow-hidden border">
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
            </div>
            <Button
              className="py-0 h-8 px-3 text-xs font-medium lg:cursor-pointer"
              onClick={() => setQuery({ dialog: "create" })}
              disabled={loading}
            >
              <Plus className="size-3" />
              Add Supplier
            </Button>
          </div>
        </div>
        <DataTable
          data={categoriesList}
          columns={column({ metaPage, setQuery, handleDelete })}
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
