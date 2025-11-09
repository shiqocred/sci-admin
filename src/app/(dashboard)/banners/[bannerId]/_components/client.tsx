"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ImageIcon,
  Loader,
  Loader2,
  RefreshCcw,
  Send,
  Trash2,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useGetDetailBanner, useUpdateBanner } from "../_api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn, formatDateTimeToISO } from "@/lib/utils";
import { BannerCore } from "../../_components/section/banner-core";
import { BannerActive } from "../../_components/section/banner-active";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteBanner, useUpdateBannerStatus } from "../../_api";
import { format } from "date-fns";
import { BannerInput } from "../../_api/types";
import { ParamsLoading } from "../../_components/_loading/params";

interface BannerInputUpdate extends BannerInput {
  imageOld: string;
}

const initialValue: BannerInputUpdate = {
  name: "",
  apply: "detail",
  selected: [],
  image: null,
  imageOld: "",
  startDate: new Date(),
  startTime: format(new Date(), "HH:mm"),
  endDate: undefined,
  endTime: format(new Date(), "HH:mm"),
  isEnd: false,
};

export const Client = () => {
  const router = useRouter();
  const { bannerId } = useParams();
  const [input, setInput] = useState<BannerInputUpdate>(initialValue);

  const [DeleteDialog, confirmDelete] = useConfirm(
    `Delete Banner ${input.name}?`,
    "This action cannot be undone",
    "destructive"
  );
  const [DeactivateDialog, confirmDeactivate] = useConfirm(
    `Deactivate Banner ${input.name}?`,
    "This banner will expire now.",
    "destructive"
  );
  const [ActivateDialog, confirmActivate] = useConfirm(
    `Activate Banner ${input.name}?`,
    "This banner will become active now and will have no end date.",
    "default"
  );

  const { mutate: updateBanner, isPending: isUpdating } = useUpdateBanner();
  const { mutate: deleteBanner, isPending: isDeleting } = useDeleteBanner();
  const { mutate: updateStatusBanner, isPending: isUpdatingStatus } =
    useUpdateBannerStatus();

  const {
    data: detail,
    isPending,
    refetch,
    isRefetching,
  } = useGetDetailBanner({
    id: bannerId as string,
  });

  const isLoading = useMemo(
    () =>
      isUpdating || isDeleting || isUpdatingStatus || isPending || isRefetching,
    [isUpdating, isDeleting, isUpdatingStatus, isPending, isRefetching]
  );

  const notSubmit = useMemo(() => {
    return (
      !input.name ||
      (!input.image && !input.imageOld) ||
      input.selected.length === 0 ||
      !input.startDate ||
      !input.startTime ||
      (input.isEnd && (!input.endDate || !input.endTime)) ||
      isLoading
    );
  }, [input, isLoading]);

  const handleUpdateBanner = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const body = new FormData();
      const appendIf = (key: string, value: any) =>
        value && body.append(key, value);

      appendIf("name", input.name);
      appendIf("type", input.apply.toUpperCase());

      for (const item of input.selected) body.append("apply", item);

      appendIf("image", input.image);

      appendIf(
        "start_banner",
        formatDateTimeToISO(input.startTime, input.startDate)
      );
      if (input.isEnd && input.endDate) {
        appendIf(
          "end_banner",
          formatDateTimeToISO(input.endTime, input.endDate)
        );
      }

      updateBanner({ body, params: { id: bannerId as string } });
    },
    [input, updateBanner, bannerId]
  );

  const handleUpdateStatus = useCallback(
    async (status?: string) => {
      if (!status) return;
      const isActivating = status === "expired" || status === "scheduled";
      const confirmed = isActivating
        ? await confirmActivate()
        : await confirmDeactivate();
      if (!confirmed) return;

      updateStatusBanner({
        body: { status: isActivating },
        params: { id: bannerId as string },
      });
    },
    [confirmActivate, confirmDeactivate, updateStatusBanner, bannerId]
  );

  const handleDelete = useCallback(async () => {
    if (await confirmDelete()) {
      deleteBanner(
        { params: { id: bannerId as string } },
        { onSuccess: () => router.push("/banners") }
      );
    }
  }, [confirmDelete, deleteBanner, router, bannerId]);

  useEffect(() => {
    if (!detail?.data) return;
    const data = detail.data;
    const startAt = new Date(data.startAt);

    const updatedInput: any = {
      ...data,
      startDate: startAt,
      startTime: format(startAt, "HH:mm"),
    };

    if (data.endAt && data.isEnd) {
      const endAt = new Date(data.endAt);
      updatedInput.endDate = endAt;
      updatedInput.endTime = format(endAt, "HH:mm");
    }

    setInput(updatedInput);
  }, [detail]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, []);

  if (!isMounted) {
    return <ParamsLoading mode="edit" />;
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <DeleteDialog />
      <DeactivateDialog />
      <ActivateDialog />

      <div className="w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="size-7 hover:bg-gray-200"
            asChild
          >
            <Link href="/banners">
              <ImageIcon className="size-5" />
            </Link>
          </Button>
          <ChevronRight className="size-4 text-gray-500" />
          <h1 className="text-xl font-semibold">Edit Banner</h1>
          <ChevronRight className="size-4 text-gray-500" />
          <h2 className="text-lg">{detail?.data.name}</h2>

          {detail?.data.status && (
            <Badge
              className={cn(
                "capitalize text-black font-medium",
                {
                  active: "bg-green-300",
                  scheduled: "bg-yellow-300",
                  expired: "bg-gray-300",
                }[detail.data.status]
              )}
            >
              {detail.data.status}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            disabled={isLoading}
            size="icon"
            variant="outline"
            className="size-8"
            onClick={() => refetch()}
          >
            <RefreshCcw
              className={cn("size-3.5", isLoading && "animate-spin")}
            />
          </Button>

          {detail?.data.status && (
            <Button
              onClick={() => handleUpdateStatus(detail.data.status)}
              variant="outline"
              size="sm"
              className="text-xs"
              disabled={isLoading}
            >
              {["expired", "scheduled"].includes(detail.data.status)
                ? "Activate"
                : "Deactivate"}
            </Button>
          )}

          <Button
            variant="outline"
            className="border-red-300 hover:border-red-400 hover:bg-red-50 text-red-500 size-8"
            size="icon"
            disabled={isLoading}
            onClick={handleDelete}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Section */}
      {isPending ? (
        <div className="h-[50vh] w-full flex items-center justify-center flex-col gap-2">
          <Loader className="size-6 animate-spin" />
          <p className="animate-pulse ml-2 text-sm">Loading...</p>
        </div>
      ) : (
        <div className="w-full grid gap-6 grid-cols-7">
          <div className="col-span-4 w-full">
            <BannerCore input={input} setInput={setInput} />
          </div>

          <div className="col-span-3 w-full">
            <BannerActive input={input} setInput={setInput} />
            <div className="flex flex-col gap-4 w-full">
              <Button disabled={notSubmit} onClick={handleUpdateBanner}>
                {isUpdating ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Updating Banner...
                  </>
                ) : (
                  <>
                    <Send /> Update Banner
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
