"use client";

import { Button } from "@/components/ui/button";
import { CheckedState } from "@radix-ui/react-checkbox";
import {
  ChevronRight,
  Coins,
  Loader,
  RefreshCcw,
  Send,
  Trash2,
} from "lucide-react";
import React, { MouseEvent, useEffect, useState } from "react";
import { useGetPromo, useUpdatePromo } from "../_api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PromoCore } from "../../_components/section/promo-core";
import { PromoActive } from "../../_components/section/promo-active";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeletePromo, useUpdatePromoStatus } from "../../_api";

export const Client = () => {
  const router = useRouter();
  const { promoId } = useParams();
  const [input, setInput] = useState({
    name: "",
    selected: [] as string[],
    image: null as File | null,
    imageOld: "",
    startDate: new Date() as Date | undefined,
    startTime: "08:00",
    endDate: undefined as Date | undefined,
    endTime: "08:00",
    isEnd: false as CheckedState | undefined,
  });

  const [DeleteDialog, confirmDelete] = useConfirm(
    `Delete Promo ${input.name}?`,
    "This action cannot be undone",
    "destructive"
  );

  const [DeactivateDialog, confirmDeactivate] = useConfirm(
    `Deactivate Promo ${input.name}?`,
    "This Promo will expire now.",
    "destructive"
  );

  const [ActivateDialog, confirmActivate] = useConfirm(
    `Activate Promo ${input.name}?`,
    "This Promo will become active now and will have no end date.",
    "default"
  );

  const { mutate: updatePromo, isPending: isUpdating } = useUpdatePromo();
  const { mutate: deletePromo, isPending: isDeleting } = useDeletePromo();
  const { mutate: updateStatusPromo, isPending: isUpdatingStatus } =
    useUpdatePromoStatus();

  const {
    data: detail,
    isPending,
    refetch,
    isRefetching,
  } = useGetPromo({ id: promoId as string });

  const isLoading =
    isUpdating || isDeleting || isUpdatingStatus || isPending || isRefetching;

  const handleCreatePromo = (e: MouseEvent) => {
    e.preventDefault();
    const body = new FormData();
    body.append("name", input.name);
    input.selected.map((item) => body.append("apply", item));
    if (input.image) {
      body.append("image", input.image);
    }
    if (input.startDate) {
      body.append("start_date", input.startDate.toString());
      body.append("start_time", input.startTime);
    }
    if (input.isEnd && input.endDate) {
      body.append("end_date", input.endDate.toString());
      body.append("end_time", input.endTime);
    }
    updatePromo({ body, params: { id: promoId as string } });
  };

  const handleUpdateStatus = async (status?: string) => {
    if (!status) return;
    const ok =
      status === "expired" || status === "scheduled"
        ? await confirmActivate()
        : await confirmDeactivate();
    if (!ok) return;
    updateStatusPromo({
      body: { status: status === "expired" || status === "scheduled" },
      params: { id: promoId as string },
    });
  };

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    deletePromo(
      { params: { id: promoId as string } },
      { onSuccess: () => router.push("/discounts") }
    );
  };

  useEffect(() => {
    if (detail) {
      setInput({
        ...(detail.data as any),
        endTime: detail.data.endTime ? detail.data.endTime : "08:00",
      });
    }
  }, [detail]);
  return (
    <div className="w-full flex flex-col gap-6">
      <DeleteDialog />
      <DeactivateDialog />
      <ActivateDialog />
      <div className="w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            size={"icon"}
            variant={"secondary"}
            className="size-7 hover:bg-gray-200"
            asChild
          >
            <Link href="/promos">
              <Coins className="size-5" />
            </Link>
          </Button>
          <ChevronRight className="size-4 text-gray-500" />
          <h1 className="text-xl font-semibold">Edit Promo</h1>
          <ChevronRight className="size-4 text-gray-500" />
          <h2 className="text-lg">{detail?.data.name}</h2>
          {detail?.data.status && (
            <Badge
              className={cn(
                "capitalize text-black font-medium",
                detail?.data.status === "active" && "bg-green-300",
                detail?.data.status === "scheduled" && "bg-yellow-300",
                detail?.data.status === "expired" && "bg-gray-300"
              )}
            >
              {detail?.data.status}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={isLoading}
            size={"icon"}
            variant={"outline"}
            className="size-8"
            onClick={() => refetch()}
          >
            <RefreshCcw
              className={cn("size-3.5", isLoading && "animate-spin")}
            />
          </Button>
          {detail?.data.status !== undefined && (
            <Button
              onClick={() => handleUpdateStatus(detail?.data.status)}
              variant={"outline"}
              size={"sm"}
              className="text-xs"
              disabled={isLoading}
            >
              {detail?.data.status === "expired" ||
              detail?.data.status === "scheduled"
                ? "Activate"
                : "Deactivate"}
            </Button>
          )}
          <Button
            variant={"outline"}
            className="border-red-300 hover:border-red-400 hover:bg-red-50 text-red-500 hover:text-red-500 size-8"
            size={"icon"}
            disabled={isLoading}
            onClick={handleDelete}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      {isPending ? (
        <div className="h-[400px] w-full flex items-center justify-center flex-col gap-2">
          <Loader className="size-6 animate-spin" />
          <p className="animate-pulse ml-2 text-sm">Loading...</p>
        </div>
      ) : (
        <div className="w-full grid gap-6 grid-cols-7">
          <div className="col-span-4 w-full">
            <PromoCore input={input} setInput={setInput} />
          </div>
          <div className="col-span-3 w-full">
            <PromoActive input={input} setInput={setInput} />
            <div className="flex flex-col gap-4 w-full">
              <Button disabled={isLoading} onClick={handleCreatePromo}>
                <Send />
                Update Promo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
