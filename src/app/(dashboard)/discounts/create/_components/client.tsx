"use client";

import { Button } from "@/components/ui/button";

import { checkedFormat } from "@/lib/utils";
import { BadgePercent, ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { MouseEvent, useState } from "react";
import { useCreateDiscount } from "../_api";
import { parseAsString, useQueryStates } from "nuqs";
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

const dateFormatted = (time: string, date: Date) => {
  const [hour, minute] = time.split(":").map(Number);
  const newDate = new Date(date);
  newDate.setHours(hour, minute, 0, 0);
  return newDate.toISOString();
};

export const Client = () => {
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
    startTime: format(new Date(), "HH:mm") ?? "08:00",
    endTime: format(new Date(), "HH:mm") ?? "08:00",
  });

  const { mutate: createDiscount } = useCreateDiscount();

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
    (checkedFormat(endDate) && !dateEnd);

  const handleCreate = (e: MouseEvent) => {
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
      startDiscount: dateStart
        ? dateFormatted(input.startTime, dateStart)
        : null,
      endDiscount:
        checkedFormat(endDate) && dateEnd
          ? dateFormatted(input.endTime, dateEnd)
          : null,
    };
    createDiscount({ body });
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-20">
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
        <h1 className="text-xl font-semibold">Add Discount</h1>
      </div>
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
            handleCreate={handleCreate}
            isDisabled={isDisabled}
          />
        </div>
      </div>
    </div>
  );
};
