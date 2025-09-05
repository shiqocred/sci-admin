"use client";

import React, { useEffect, useMemo } from "react";
import { column } from "./columns";
import { Plus, RefreshCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { useChangeStatus, useDeleteProduct, useGetProducts } from "../_api";
import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";
import { useSearchQuery } from "@/lib/search";
import { usePagination } from "@/lib/pagination";
import Pagination from "@/components/pagination";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { TooltipText } from "@/providers/tooltip-provider";
import { SortTable } from "@/components/sort-table";
import { ProductFilter } from "./product-filter";

const filterField = [
  { name: "Name", value: "name" },
  { name: "Stok", value: "stock" },
  { name: "Status", value: "status" },
];

export const Client = () => {
  const router = useRouter();
  const [
    { sort, order, categoryId, supplierId, petId, statusProduct },
    setQuery,
  ] = useQueryStates(
    {
      sort: parseAsString.withDefault("created"),
      order: parseAsString.withDefault("desc"),
      statusProduct: parseAsString.withDefault(""),
      categoryId: parseAsArrayOf(parseAsString.withDefault(""), ";"),
      supplierId: parseAsArrayOf(parseAsString.withDefault(""), ";"),
      petId: parseAsArrayOf(parseAsString.withDefault(""), ";"),
    },
    {
      urlKeys: {
        statusProduct: "status",
      },
    }
  );

  let formatedStatus: boolean | undefined;

  if (statusProduct === "publish") {
    formatedStatus = true;
  } else if (statusProduct === "draft") {
    formatedStatus = false;
  } else {
    formatedStatus = undefined;
  }

  const [ChangeStatusDialog, confirmChangeStatus] = useConfirm(
    "Change Status Product",
    "This action cannot be undone"
  );
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Product",
    "This action cannot be undone",
    "destructive"
  );

  const { mutate: changeStatus, isPending: isChanging } = useChangeStatus();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, metaPage, limit, setLimit, setPage, setPagination } =
    usePagination();
  const { data, isSuccess, refetch, isRefetching, isPending } = useGetProducts({
    q: searchValue,
    p: page,
    limit,
    sort,
    order,
    categoryId: categoryId ?? undefined,
    petId: petId ?? undefined,
    supplierId: supplierId ?? undefined,
    status: formatedStatus,
  });

  const loading = isPending || isRefetching || isChanging || isDeleting;

  const productList = useMemo(() => {
    return data?.data.data ?? [];
  }, [data]);

  const handleMove = (id: string, type: "detail" | "edit") => {
    router.push(`/products/${id}/${type === "detail" ? "detail" : "edit"}`);
  };

  const handleChangeStatus = async (id: string) => {
    const ok = await confirmChangeStatus();
    if (!ok) return;
    changeStatus({ params: { id } });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteProduct({ params: { id } });
  };

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data.data.pagination);
    }
  }, [isSuccess, data]);
  return (
    <div className="w-full flex flex-col gap-6">
      <ChangeStatusDialog />
      <DeleteDialog />
      <div className="w-full flex items-center gap-4 justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <div className="flex items-center gap-2">
          {/* <div className="flex rounded-md overflow-hidden border">
            <Button
              className="size-8 flex-none rounded-none"
              variant={"ghost"}
              size={"icon"}
              disabled={loading}
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
              disabled={loading}
            >
              <Download className="size-3.5" />
            </Button>
          </div> */}
          <Button
            className="py-0 h-8 px-3 text-xs font-medium lg:cursor-pointer"
            asChild
            disabled={loading}
          >
            <Link href={"/products/create"}>
              <Plus className="size-3" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center w-full justify-between gap-2">
          <ProductFilter
            data={data}
            categoryId={categoryId}
            petId={petId}
            setQuery={setQuery}
            statusProduct={statusProduct}
            supplierId={supplierId}
            disabled={loading}
          />
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
            <SortTable
              order={order}
              sort={sort}
              setSort={setQuery}
              data={filterField}
              disabled={loading}
            />
          </div>
        </div>
        <DataTable
          data={productList}
          isLoading={isPending}
          columns={column({
            metaPage,
            handleDelete,
            handleChangeStatus,
            handleMove,
            isLoading: isDeleting || isChanging,
          })}
        />
        <Pagination
          pagination={{ ...metaPage, current: page, limit }}
          setPagination={setPage}
          setLimit={setLimit}
          disabled={loading}
        />
      </div>
    </div>
  );
};
