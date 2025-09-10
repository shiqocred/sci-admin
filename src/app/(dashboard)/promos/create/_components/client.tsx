"use client";

import { Button } from "@/components/ui/button";
import { CheckedState } from "@radix-ui/react-checkbox";
import { ChevronRight, Coins, Loader2, Send } from "lucide-react";
import React, { MouseEvent, useState } from "react";
import { useCreatePromo } from "../_api";
import Link from "next/link";
import { PromoCore } from "../../_components/section/promo-core";
import { PromoActive } from "../../_components/section/promo-active";
import { format } from "date-fns";

export const Client = () => {
  const [input, setInput] = useState({
    name: "",
    selected: [] as string[],
    image: null as File | null,
    startDate: new Date() as Date | undefined,
    startTime: format(new Date(), "HH:mm") ?? "08:00",
    endDate: undefined as Date | undefined,
    endTime: format(new Date(), "HH:mm") ?? "08:00",
    isEnd: false as CheckedState | undefined,
  });

  const { mutate: createPromo, isPending: isCreating } = useCreatePromo();

  const handleCreatePromo = (e: MouseEvent) => {
    e.preventDefault();
    const body = new FormData();
    body.append("name", input.name);
    input.selected.map((item) => body.append("apply", item));
    if (input.image) {
      body.append("image", input.image);
    }
    if (input.startDate) {
      const [hourStart, minuteStart] = input.startTime.split(":").map(Number);
      const newDateStart = new Date(input.startDate);
      newDateStart.setHours(hourStart, minuteStart, 0, 0);
      body.append("start_promo", newDateStart.toString());
    }
    if (input.isEnd && input.endDate) {
      const [hourEnd, minuteEnd] = input.endTime.split(":").map(Number);
      const newDateEnd = new Date(input.endDate);
      newDateEnd.setHours(hourEnd, minuteEnd, 0, 0);
      body.append("end_promo", newDateEnd.toString());
    }
    createPromo({ body });
  };

  const notSubmit =
    isCreating ||
    !input.name ||
    !input.image ||
    input.selected.length === 0 ||
    !input.startDate ||
    !input.startTime ||
    (input.isEnd && (!input.endDate || !input.endTime));

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex items-center gap-2">
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
        <h1 className="text-xl font-semibold">Add Promo</h1>
      </div>
      <div className="w-full grid gap-6 grid-cols-7">
        <div className="col-span-4 w-full">
          <PromoCore input={input} setInput={setInput} />
        </div>
        <div className="col-span-3 w-full">
          <div className="flex flex-col gap-4 w-full">
            <PromoActive input={input} setInput={setInput} />
            <Button onClick={handleCreatePromo} disabled={notSubmit}>
              {isCreating ? <Loader2 className="animate-spin" /> : <Send />}
              Creat{isCreating ? "ing" : "e"} Promo{isCreating && "..."}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
