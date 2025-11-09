"use client";

import React, { useEffect, useMemo, useState } from "react";
import { parseAsString, useQueryStates } from "nuqs";

import Pagination from "@/components/pagination";
import { DataTable } from "@/components/data-table";
import { CreateEditDialog } from "./_dialog/create-edit-dialog";

import { useSearchQuery } from "@/lib/search";
import { usePagination } from "@/lib/pagination";
import { useConfirm } from "@/hooks/use-confirm";

import { useDeleteCategory, useGetCategories } from "../_api";
import { Header } from "./_section/categories-header";
import { column } from "./_section/categories-columns";
import { MainLoading } from "./_loading/main";

export const Client = () => {
  const [{ dialog, categoryId, sort, order }, setQuery] = useQueryStates(
    {
      dialog: parseAsString.withDefault(""),
      categoryId: parseAsString.withDefault(""),
      sort: parseAsString.withDefault("created"),
      order: parseAsString.withDefault("desc"),
    },
    {
      urlKeys: {
        categoryId: "id",
      },
    }
  );

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Category",
    "This action cannot be undone",
    "destructive"
  );

  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, metaPage, limit, setLimit, setPage, setPagination } =
    usePagination();
  const { data, refetch, isRefetching, isSuccess, isPending } =
    useGetCategories({
      q: searchValue,
      p: page,
      limit,
      sort,
      order,
    });

  const loading = isDeleting || isRefetching || isPending;

  const categoriesList = useMemo(() => {
    return data?.data?.data ?? [];
  }, [data]);

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteCategory({ params: { id } });
  };

  useEffect(() => {
    if (categoryId && (!dialog || dialog === null)) {
      setQuery({ dialog: null });
    }
  }, [categoryId, dialog]);

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data.data.pagination);
    }
  }, [isSuccess, data]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, []);

  if (!isMounted) {
    return <MainLoading />;
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <DeleteDialog />
      <CreateEditDialog
        open={dialog === "create" || dialog === "edit"}
        onOpenChange={() => {
          setQuery({ categoryId: null, dialog: null });
        }}
        categoryId={categoryId}
      />
      <Header
        sort={sort}
        order={order}
        search={search}
        loading={loading}
        refetch={refetch}
        setSearch={setSearch}
        setQuery={setQuery}
      />
      <div className="flex w-full flex-col gap-3">
        <DataTable
          data={categoriesList}
          columns={column({
            metaPage,
            setQuery,
            handleDelete,
            isLoading: isDeleting,
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
