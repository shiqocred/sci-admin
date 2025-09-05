"use client";

import { Button } from "@/components/ui/button";

import { checkedFormat, checkedToString, cn } from "@/lib/utils";
import {
  BadgePercent,
  ChevronRight,
  Loader,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import React, { MouseEvent, useEffect, useState } from "react";
import { useUpdateDiscount, useGetDiscount } from "../_api";
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
import { id } from "date-fns/locale";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteDiscount, useUpdateDiscountStatus } from "../../_api";

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
  const { discountId } = useParams();
  const router = useRouter();
  const [dateStart, setDateStart] = React.useState<Date | undefined>(
    new Date()
  );
  const [dateEnd, setDateEnd] = React.useState<Date | undefined>(new Date());

  const [
    { apply, eligibility, endDate, limitOnce, limitUse, minimumReq, value },
    setDiscounts,
  ] = useQueryStates({
    value: parseAsString.withDefault("percentage"),
    apply: parseAsString.withDefault("categories"),
    eligibility: parseAsString.withDefault("all"),
    minimumReq: parseAsString.withDefault("nothing"),
    limitUse: parseAsString.withDefault("false"),
    limitOnce: parseAsString.withDefault("false"),
    endDate: parseAsString.withDefault("false"),
  });

  const [input, setInput] = useState<InputProps>({
    voucher: "",
    percentage: "0",
    fixed: "0",
    selected: [],
    role: [],
    userId: [],
    purchase: "0",
    quantity: "0",
    use: "0",
    startTime: format(new Date(), "HH.mm"),
    endTime: format(new Date(), "HH.mm"),
  });

  const [DeleteDialog, confirmDelete] = useConfirm(
    `Delete Voucher ${input.voucher}?`,
    "This action cannot be undone",
    "destructive"
  );

  const [DeactivateDialog, confirmDeactivate] = useConfirm(
    `Deactivate Voucher ${input.voucher}?`,
    "This discount will expire now.",
    "destructive"
  );

  const [ActivateDialog, confirmActivate] = useConfirm(
    `Activate Voucher ${input.voucher}?`,
    "This discount will become active now and will have no end date.",
    "default"
  );

  const { mutate: updateDiscount, isPending: isUpdating } = useUpdateDiscount();
  const { mutate: deleteDiscount, isPending: isDeleting } = useDeleteDiscount();
  const { mutate: updateDiscountStatus, isPending: isUpdatingStatus } =
    useUpdateDiscountStatus();

  const { data, refetch, isRefetching, isPending } = useGetDiscount({
    discountId: discountId as string,
  });

  useEffect(() => {
    const detail = data?.data;
    if (!detail) return;

    const {
      code,
      value,
      valueType,
      apply,
      applyType,
      eligibility,
      eligibilityType,
      minimum,
      minimumType,
      limitUse,
      limitOnce,
      startDiscount,
      endDiscount,
    } = detail;

    const getValueByType = (type: string) => ({
      percentage: type === "percentage" ? value : "0",
      fixed: type === "fixed" ? value : "0",
    });

    const getMinimumByType = (type: string) => ({
      purchase: type === "amount" ? (minimum ?? "0") : "0",
      quantity: type === "quantity" ? (minimum ?? "0") : "0",
    });

    const { percentage, fixed } = getValueByType(valueType);
    const { purchase, quantity } = getMinimumByType(minimumType ?? "");

    setInput({
      voucher: code,
      percentage,
      fixed,
      selected: apply,
      role: eligibilityType === "role" ? eligibility : [],
      userId: eligibilityType === "user" ? eligibility : [],
      purchase,
      quantity,
      use: limitUse ?? "0",
      startTime: format(startDiscount, "HH:mm", { locale: id }),
      endTime: endDiscount
        ? format(endDiscount, "HH:mm", { locale: id })
        : "08:00",
    });

    setDiscounts({
      apply: applyType,
      eligibility: eligibilityType,
      endDate: endDiscount ? "true" : "false",
      limitOnce: checkedToString(limitOnce as CheckedState),
      limitUse: limitUse ? "true" : "false",
      minimumReq: minimumType,
      value: valueType,
    });
    setDateStart(startDiscount);
    setDateEnd(endDiscount ?? new Date());
  }, [data]);

  const isDisabled =
    !input.voucher ||
    (value === "percentage" ? !input.percentage : !input.fixed) ||
    input.selected.length < 1 ||
    (minimumReq === "amount" && !input.purchase) ||
    (minimumReq === "quantity" && !input.quantity) ||
    (eligibility === "role" && input.role.length < 1) ||
    (eligibility === "user" && input.userId.length < 1) ||
    (checkedFormat(limitUse) && !input.use) ||
    !dateStart ||
    (checkedFormat(endDate) && !dateEnd) ||
    isUpdating ||
    isDeleting ||
    isUpdatingStatus ||
    isPending;

  const handleUpdate = (e: MouseEvent) => {
    e.preventDefault();

    const body = {
      code: input.voucher,
      valueType: value,
      value: value === "percentage" ? input.percentage : input.fixed,
      applyType: apply,
      apply: input.selected,
      eligibilityType: eligibility,
      eligibility: eligibilityFormatted(eligibility, input),
      minimumType: minimumReq,
      minimum: minimumFormatted(minimumReq, input),
      limitUse: checkedFormat(limitUse) ? input.use : null,
      limitOnce: checkedFormat(limitOnce),
      startDiscount: startDateFormatted(input, dateStart) ?? null,
      endDiscount: checkedFormat(endDate)
        ? endDateFormatted(input, dateEnd, checkedFormat(endDate))
        : null,
    };
    updateDiscount({ body, params: { id: discountId as string } });
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
      params: { id: discountId as string },
    });
  };

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteDiscount(
      { params: { id: discountId as string } },
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
            <Link href="/discounts">
              <BadgePercent className="size-5" />
            </Link>
          </Button>
          <ChevronRight className="size-4 text-gray-500" />
          <h1 className="text-xl font-semibold">Edit Discount</h1>
          <ChevronRight className="size-4 text-gray-500" />
          <h3 className="text-base font-medium">{data?.data.code}</h3>
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
        <div className="w-full flex flex-col gap-2 items-center justify-center h-[50vh]">
          <Loader className="animate-spin size-5" />
          <p className="ml-2 text-sm animate-pulse">Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-4 col-span-2">
            <DiscountCore
              apply={apply}
              input={input}
              setDiscounts={setDiscounts}
              setInput={setInput}
              value={value}
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
              value={value}
              apply={apply}
              eligibility={eligibility}
              minimumReq={minimumReq}
              limitOnce={limitOnce}
              dateStart={dateStart}
              endDate={endDate}
              dateEnd={dateEnd}
              handleCreate={handleUpdate}
              isDisabled={isDisabled}
              status={data?.data.status}
            />
          </div>
        </div>
      )}
    </div>
  );
};
