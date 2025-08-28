"use client";

import { Button } from "@/components/ui/button";

import { checkedFormat } from "@/lib/utils";
import { ChevronRight, TruckIcon } from "lucide-react";
import Link from "next/link";
import React, { MouseEvent, useState } from "react";
import { useCreateFreeShipping } from "../_api";
import { CheckedState } from "@radix-ui/react-checkbox";
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

  const { mutate: createFreeShipping } = useCreateFreeShipping();

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
    (checkedFormat(endDate) && !dateEnd);

  const handleCreate = (e: MouseEvent) => {
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
    createFreeShipping(
      { body },
      { onError: (error) => setErrors((error.response?.data as any).errors) }
    );
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
          <Link href="/free-shippings">
            <TruckIcon className="size-5" />
          </Link>
        </Button>
        <ChevronRight className="size-4 text-gray-500" />
        <h1 className="text-xl font-semibold">Add Free Shipping</h1>
      </div>
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
            handleCreate={handleCreate}
            isDisabled={isDisabled}
          />
        </div>
      </div>
    </div>
  );
};
