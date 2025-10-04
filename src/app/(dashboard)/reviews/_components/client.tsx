"use client";

import { DataTable } from "@/components/data-table";
import { SortTable } from "@/components/sort-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchQuery } from "@/lib/search";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { RefreshCcw, XCircle } from "lucide-react";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  useQueryStates,
} from "nuqs";
import React, { useEffect, useMemo, useState } from "react";
import { column } from "./columns";
import { useGetReviews, useUpdateReview } from "../_api";
import { usePagination } from "@/lib/pagination";
import Pagination from "@/components/pagination";
import { DetailDialog } from "./_dialogs/detail-dialog";
import { ReviewsFilter } from "./reviews-filter";

const filterField = [
  { name: "Title", value: "title" },
  { name: "Rating", value: "rating" },
  { name: "Status", value: "status" },
  { name: "User", value: "user" },
];

export const Client = () => {
  const [input, setInput] = useState("publish");
  const [
    { sort, order, reviewId, dialog, userId, status, minRating, maxRating },
    setQuery,
  ] = useQueryStates(
    {
      sort: parseAsString.withDefault("created"),
      order: parseAsString.withDefault("desc"),
      reviewId: parseAsString.withDefault(""),
      dialog: parseAsBoolean.withDefault(false),
      userId: parseAsArrayOf(parseAsString.withDefault("")).withDefault([]),
      status: parseAsString.withDefault(""),
      minRating: parseAsString.withDefault(""),
      maxRating: parseAsString.withDefault(""),
    },
    {
      urlKeys: {
        reviewId: "id",
      },
    }
  );

  const { mutate: updateReview } = useUpdateReview();

  const { page, metaPage, limit, setLimit, setPage, setPagination } =
    usePagination();
  const { search, searchValue, setSearch } = useSearchQuery();
  const { data, isPending, refetch, isSuccess, isRefetching } = useGetReviews({
    q: searchValue,
    p: page,
    order,
    sort,
    limit,
    userId,
    status,
    minRating,
    maxRating,
  });

  const ordersList = useMemo(() => data?.data.data, [data]);
  const handleUpdate = (id?: string, status?: boolean) => {
    updateReview(
      {
        params: { reviewId: id ?? reviewId },
        body: { status: status ?? input === "publish" },
      },
      {
        onSuccess: () =>
          setQuery({
            reviewId: "",
            dialog: false,
          }),
      }
    );
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
      </div>
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center w-full justify-between gap-2">
          <ReviewsFilter
            query={{ userId, status, minRating, maxRating }}
            setQuery={setQuery}
            data={data?.data.options}
            current={data?.data.current}
          />
          <div className="flex items-center gap-2">
            <div className="relative flex items-center group">
              <Input
                className="h-8 focus-visible:ring-0 shadow-none w-52 placeholder:text-xs"
                placeholder="Search review..."
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
          columns={column({ metaPage, setQuery, handleUpdate })}
          isLoading={isPending || isRefetching}
        />
        <Pagination
          pagination={{ ...metaPage, current: page, limit }}
          setPagination={setPage}
          setLimit={setLimit}
          disabled={isPending || isRefetching}
        />
      </div>
      <DetailDialog
        dialog={dialog}
        reviewId={reviewId}
        setQuery={setQuery}
        input={input}
        setInput={setInput}
        handleUpdate={handleUpdate}
      />
    </div>
  );
};
