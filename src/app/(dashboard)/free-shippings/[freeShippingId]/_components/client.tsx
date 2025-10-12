"use client";

import { Button } from "@/components/ui/button";

import { checkedFormat, checkedToString, cn } from "@/lib/utils";
import { ChevronRight, Loader, RefreshCcw, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import React, { MouseEvent, useEffect, useState } from "react";
import { useUpdateFreeShipping, useGetFreeShipping } from "../_api";
import { CheckedState } from "@radix-ui/react-checkbox";
import { parseAsString, useQueryStates } from "nuqs";
import { useParams, useRouter } from "next/navigation";
import {
  DiscountCore,
  DiscountDate,
  DiscountEligibility,
  DiscountLimit,
  DiscountMinimum,
  DiscountSummary,
} from "../../_components/_section";
import { InputProps } from "../../_components/client";
import { format } from "date-fns";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteFreeShipping, useUpdateFreeShippingStatus } from "../../_api";

const minimumFormatted = (minimumReq: string, input: InputProps) => {
  if (minimumReq === "amount") return input.purchase;
  if (minimumReq === "quantity") return input.quantity;
  return null;
};

const eligibilityFormatted = (eligibility: string, input: InputProps) => {
  if (eligibility === "role") return input.role;
  if (eligibility === "user") return input.userId;
  return null;
};

const endDateFormatted = (
  input: InputProps,
  dateEnd: Date | undefined,
  endDate: CheckedState
) => {
  if (input.endTime && dateEnd && endDate) {
    const [hourEnd, minuteEnd] = input.endTime.split(":").map(Number);
    const newDateEnd = new Date(dateEnd);
    newDateEnd.setHours(hourEnd, minuteEnd, 0, 0);
    return newDateEnd;
  } else {
    return dateEnd;
  }
};

const startDateFormatted = (input: InputProps, dateStart: Date | undefined) => {
  if (input.startTime && dateStart) {
    const [hourStart, minuteStart] = input.startTime.split(":").map(Number);
    const newDateStart = new Date(dateStart);
    newDateStart.setHours(hourStart, minuteStart, 0, 0);
    return newDateStart;
  } else {
    return dateStart;
  }
};

export const Client = () => {
  const { freeShippingId } = useParams();
  const router = useRouter();
  const [dateStart, setDateStart] = React.useState<Date | undefined>(
    new Date()
  );
  const [dateEnd, setDateEnd] = React.useState<Date | undefined>(new Date());
  const [errors, setErrors] = useState({ name: "", apply: "" });

  const [
    { apply, eligibility, endDate, limitOnce, limitUse, minimumReq },
    setDiscounts,
  ] = useQueryStates({
    apply: parseAsString.withDefault("categories"),
    eligibility: parseAsString.withDefault("all"),
    minimumReq: parseAsString.withDefault("nothing"),
    limitUse: parseAsString.withDefault("false"),
    limitOnce: parseAsString.withDefault("false"),
    endDate: parseAsString.withDefault("false"),
  });

  const [input, setInput] = useState<InputProps>({
    name: "",
    selected: [],
    role: [],
    userId: [],
    purchase: "0",
    quantity: "0",
    use: "0",
    startTime: "08:00",
    endTime: "08:00",
  });

  const [DeleteDialog, confirmDelete] = useConfirm(
    `Delete ${input.name}?`,
    "This action cannot be undone",
    "destructive"
  );

  const [DeactivateDialog, confirmDeactivate] = useConfirm(
    `Deactivate ${input.name}?`,
    "This free shipping will expire now.",
    "destructive"
  );

  const [ActivateDialog, confirmActivate] = useConfirm(
    `Activate ${input.name}?`,
    "This free shipping will become active now and will have no end date.",
    "default"
  );

  const { mutate: updateDiscount, isPending: isUpdating } =
    useUpdateFreeShipping();
  const { mutate: deleteDiscount, isPending: isDeleting } =
    useDeleteFreeShipping();
  const { mutate: updateDiscountStatus, isPending: isUpdatingStatus } =
    useUpdateFreeShippingStatus();

  const { data, refetch, isRefetching, isPending } = useGetFreeShipping({
    freeShippingId: freeShippingId as string,
  });

  useEffect(() => {
    const detail = data?.data;
    if (!detail) return;

    const {
      apply,
      applyType,
      eligibility,
      eligibilityType,
      minimum,
      minimumType,
      limitUse,
      limitOnce,
      name,
      startFreeShipping,
      endFreeShipping,
    } = detail;

    const getMinimumByType = (type: string) => ({
      purchase: type === "amount" ? (minimum ?? "0") : "0",
      quantity: type === "quantity" ? (minimum ?? "0") : "0",
    });

    const { purchase, quantity } = getMinimumByType(minimumType ?? "");

    setInput({
      name,
      selected: apply,
      role: eligibilityType === "role" ? eligibility : [],
      userId: eligibilityType === "user" ? eligibility : [],
      purchase,
      quantity,
      use: limitUse ?? "0",
      startTime: format(new Date(startFreeShipping), "HH:mm"),
      endTime: endFreeShipping
        ? format(new Date(endFreeShipping), "HH:mm")
        : "08:00",
    });

    setDiscounts({
      apply: applyType,
      eligibility: eligibilityType,
      endDate: endFreeShipping ? "true" : "false",
      limitOnce: checkedToString(limitOnce as CheckedState),
      limitUse: limitUse ? "true" : "false",
      minimumReq: minimumType,
    });
    setDateStart(new Date(startFreeShipping));
    setDateEnd(endFreeShipping ? new Date(endFreeShipping) : undefined);
  }, [data]);

  const isDisabled =
    !input.name ||
    input.selected.length < 1 ||
    (eligibility === "role" && input.role.length < 1) ||
    (eligibility === "user" && input.userId.length < 1) ||
    (minimumReq === "amount" &&
      (!input.purchase || parseFloat(input.purchase) === 0)) ||
    (minimumReq === "quantity" &&
      (!input.quantity || parseFloat(input.quantity) === 0)) ||
    (checkedFormat(limitUse) &&
      (!input.use || parseFloat(input.quantity) === 0)) ||
    !dateStart ||
    (checkedFormat(endDate) && !dateEnd) ||
    isUpdating ||
    isDeleting ||
    isUpdatingStatus ||
    isPending;

  const handleUpdate = (e: MouseEvent) => {
    e.preventDefault();

    const body = {
      name: input.name,
      applyType: apply,
      apply: input.selected,
      eligibilityType: eligibility,
      eligibility: eligibilityFormatted(eligibility, input),
      minimumType: minimumReq,
      minimum: minimumFormatted(minimumReq, input),
      limitUse: checkedFormat(limitUse) ? input.use : null,
      limitOnce: checkedFormat(limitOnce),
      startFreeShipping: startDateFormatted(input, dateStart) ?? null,
      endFreeShipping: checkedFormat(endDate)
        ? endDateFormatted(input, dateEnd, checkedFormat(endDate))
        : null,
    };
    updateDiscount(
      { body, params: { id: freeShippingId as string } },
      { onError: (err) => setErrors((err.response?.data as any).errors) }
    );
  };

  const handleUpdateStatus = async (
    status: "active" | "expired" | "scheduled"
  ) => {
    const ok =
      status === "expired" || status === "scheduled"
        ? await confirmActivate()
        : await confirmDeactivate();
    if (!ok) return;
    updateDiscountStatus({
      body: { status: status === "expired" || status === "scheduled" },
      params: { id: freeShippingId as string },
    });
  };

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteDiscount(
      { params: { id: freeShippingId as string } },
      { onSuccess: () => router.push("/discounts") }
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-20">
      <DeleteDialog />
      <DeactivateDialog />
      <ActivateDialog />
      <div className="w-full flex items-center gap-4 justify-between">
        <div className="w-full flex items-center gap-2">
          <Button
            size={"icon"}
            variant={"secondary"}
            className="size-7 hover:bg-gray-200"
            asChild
          >
            <Link href="/free-shippings">
              <Truck className="size-5" />
            </Link>
          </Button>
          <ChevronRight className="size-4 text-gray-500" />
          <h1 className="text-xl font-semibold">Edit Free Shipping</h1>
          <ChevronRight className="size-4 text-gray-500" />
          <h3 className="text-base font-medium">{data?.data.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetch()}
            variant={"outline"}
            size={"icon"}
            className="size-8"
          >
            <RefreshCcw
              className={cn("size-3.5", isRefetching && "animate-spin")}
            />
          </Button>
          {data?.data.status !== undefined && (
            <Button
              onClick={() => handleUpdateStatus(data?.data.status)}
              variant={"outline"}
              size={"sm"}
              className="text-xs"
            >
              {data?.data.status === "expired" ||
              data?.data.status === "scheduled"
                ? "Activate"
                : "Deactivate"}
            </Button>
          )}
          <Button
            variant={"outline"}
            className="border-red-300 hover:border-red-400 hover:bg-red-50 text-red-500 hover:text-red-500 size-8"
            size={"icon"}
            onClick={handleDelete}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      {isPending ? (
        <div className="h-[50vh] w-full flex items-center justify-center flex-col gap-2">
          <Loader className="size-6 animate-spin" />
          <p className="animate-pulse ml-2 text-sm">Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-4 col-span-2">
            <DiscountCore
              apply={apply}
              input={input}
              setDiscounts={setDiscounts}
              setInput={setInput}
              errors={errors}
            />
            <DiscountEligibility
              eligibility={eligibility}
              input={input}
              setDiscounts={setDiscounts}
              setInput={setInput}
            />
            <DiscountMinimum
              minimumReq={minimumReq}
              input={input}
              setDiscounts={setDiscounts}
              setInput={setInput}
            />
            <DiscountLimit
              limitUse={limitUse}
              limitOnce={limitOnce}
              input={input}
              setDiscounts={setDiscounts}
              setInput={setInput}
            />
            <DiscountDate
              dateEnd={dateEnd}
              dateStart={dateStart}
              setDateEnd={setDateEnd}
              setDateStart={setDateStart}
              endDate={endDate}
              input={input}
              setDiscounts={setDiscounts}
              setInput={setInput}
            />
          </div>
          <div className="col-span-1 relative">
            <DiscountSummary
              input={input}
              apply={apply}
              eligibility={eligibility}
              minimumReq={minimumReq}
              limitOnce={limitOnce}
              dateStart={dateStart}
              endDate={endDate}
              dateEnd={dateEnd}
              handleCreate={handleUpdate}
              isDisabled={isDisabled}
              isSubmitting={isUpdating}
              status={data?.data.status}
            />
          </div>
        </div>
      )}
    </div>
  );
};
