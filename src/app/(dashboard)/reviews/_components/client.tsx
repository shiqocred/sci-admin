"use client";

import { DataTable } from "@/components/data-table";
import { SortTable } from "@/components/sort-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchQuery } from "@/lib/search";
import { cn, sizesImage } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import {
  ChartNoAxesGanttIcon,
  ChevronRight,
  LoaderIcon,
  RefreshCcw,
  Save,
  ShoppingBag,
  X,
  XCircle,
} from "lucide-react";
import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";
import React, { useEffect, useMemo, useState } from "react";
import { column } from "./columns";
import { useGetReviews, useGetShowReview, useUpdateReview } from "../_api";
import { usePagination } from "@/lib/pagination";
import Pagination from "@/components/pagination";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LabelInput } from "@/components/label-input";
import { Label } from "@/components/ui/label";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";

const filterField = [
  { name: "Title", value: "title" },
  { name: "Rating", value: "rating" },
  { name: "Status", value: "status" },
  { name: "User", value: "user" },
];

export const Client = () => {
  const [{ sort, order, reviewId, dialog }, setQuery] = useQueryStates(
    {
      sort: parseAsString.withDefault("created"),
      order: parseAsString.withDefault("desc"),
      reviewId: parseAsString.withDefault(""),
      dialog: parseAsBoolean.withDefault(false),
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
  });
  const { data: reviewDetail, isPending: isPendingDetail } = useGetShowReview({
    reviewId,
  });

  const [input, setInput] = useState({ status: "publish" });

  const ordersList = useMemo(() => data?.data.data, [data]);
  const detailReview = useMemo(() => reviewDetail?.data, [reviewDetail]);

  const handleUpdate = (id?: string, status?: boolean) => {
    updateReview(
      {
        params: { reviewId: id ?? reviewId },
        body: { status: status ?? input.status === "publish" },
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

  useEffect(() => {
    if (detailReview) {
      setInput({ status: detailReview.status });
    }
  }, [detailReview]);
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex items-center gap-4 justify-between">
        <h1 className="text-xl font-semibold">Reviews</h1>
      </div>
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center w-full justify-between gap-2">
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
      <Sheet
        open={dialog && !!reviewId}
        onOpenChange={() => {
          setQuery({
            reviewId: "",
            dialog: false,
          });
        }}
      >
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Review Detail</SheetTitle>
            <SheetDescription />
          </SheetHeader>
          {isPendingDetail && (
            <div className="px-4 flex flex-col gap-2 justify-center items-center h-[80vh]">
              <LoaderIcon className="size-4 animate-spin" />
              <p className="ml-2 animate-pulse text-sm">Loading...</p>
            </div>
          )}
          {detailReview && (
            <div className="px-4 flex flex-col gap-4 overflow-y-auto">
              <LabelInput
                label="Title"
                defaultValue={detailReview.title}
                disabled
                className="disabled:opacity-100"
              />
              <div className="flex flex-col gap-1">
                <Label>Rating</Label>
                <Rating defaultValue={detailReview.rating} readOnly>
                  {Array.from({ length: 5 }, (_, i) => (
                    <RatingButton key={i} className="text-yellow-500" />
                  ))}
                </Rating>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Description</Label>
                <Textarea
                  defaultValue={detailReview.description}
                  className="border-gray-300 focus-visible:border-gray-500 focus-visible:ring-0 min-h-32 disabled:opacity-100 disabled:cursor-default resize-none"
                  disabled
                />
              </div>
              <div className="grid grid-cols-5 gap-2">
                {detailReview.images.map((image) => (
                  <div
                    key={image}
                    className="w-full aspect-square rounded-md border shadow relative overflow-hidden"
                  >
                    <Image
                      fill
                      src={image ?? "/images/logo-sci.png"}
                      alt={detailReview.title}
                      sizes={sizesImage}
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Product Relations</Label>
                <div className="border w-full rounded-md overflow-hidden divide-y">
                  {detailReview.product.map((i) => (
                    <Link
                      key={i.id}
                      className="min-h-8 py-1.5 px-3 flex items-center gap-2 text-sm hover:underline hover:underline-offset-2"
                      href={`/products/${i.id}/detail`}
                    >
                      <ChartNoAxesGanttIcon className="size-4" />
                      <ChevronRight className="size-3.5" />
                      <p>{i.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Order Relation</Label>
                <div className="border w-full rounded-md overflow-hidden divide-y">
                  <Link
                    className="h-8 px-3 flex items-center gap-2 text-sm hover:underline hover:underline-offset-2 font-medium"
                    href={`/orders/${detailReview.orderId}`}
                  >
                    <ShoppingBag className="size-4" />
                    <ChevronRight className="size-3.5" />
                    <p>#{detailReview.orderId}</p>
                  </Link>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Customer</Label>
                <div className="flex items-center gap-4 p-2 text-sm border rounded-lg">
                  <div className="size-12 relative overflow-hidden border rounded-md">
                    <Image
                      fill
                      src={detailReview.user.image ?? "/images/logo-sci.png"}
                      alt={detailReview.user.name}
                      sizes={sizesImage}
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-medium">{detailReview.user.name}</p>
                    <p className="text-gray-500">{detailReview.user.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Status</Label>
                <Select
                  value={input.status}
                  onValueChange={(e) => setInput({ status: e })}
                >
                  <SelectTrigger className="border-gray-300 focus-visible:border-gray-300 focus-visible:ring-0 w-full data-[state=open]:border-gray-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="publish">Publish</SelectItem>
                      <SelectItem value="unpublish">Unpublish</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={"outline"}
                  onClick={() => {
                    setQuery({
                      reviewId: "",
                      dialog: false,
                    });
                  }}
                >
                  <X />
                  Cancel
                </Button>
                <Button onClick={() => handleUpdate()} className="col-span-2">
                  <Save />
                  Save
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
