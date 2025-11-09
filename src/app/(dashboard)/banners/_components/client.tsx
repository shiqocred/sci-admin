"use client";

import React, { useEffect, useMemo, useState } from "react";
import { parseAsString, useQueryStates } from "nuqs";

import Pagination from "@/components/pagination";
import { DataTable } from "@/components/data-table";

import { bannerColumns } from "./section/banner-columns";
import { useSearchQuery } from "@/lib/search";
import { usePagination } from "@/lib/pagination";
import { useConfirm } from "@/hooks/use-confirm";

import { useDeleteBanner, useGetBanners, useUpdateBannerStatus } from "../_api";
import { Header } from "./section/banner-client-header";
import { MainLoading } from "./_loading/main";

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
    const isNotActive = status === "expired" || status === "scheduled";
    const ok = isNotActive
      ? await confirmActivate()
      : await confirmDeactivate();

    if (!ok) return;

    updateBanner({
      body: { status: isNotActive },
      params: { id },
    });
  };

  useEffect(() => {
    if (data && isSuccess) setPagination(data.data.pagination);
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
      <DeactivateDialog />
      <ActivateDialog />
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
          data={bannersList}
          columns={bannerColumns({
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
