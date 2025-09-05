"use client";

import { Button } from "@/components/ui/button";
import { CheckedState } from "@radix-ui/react-checkbox";
import { ChevronRight, ImageIcon, Loader2, Send } from "lucide-react";
import React, { MouseEvent, useState } from "react";
import { useCreateBanner } from "../_api";
import Link from "next/link";
import { BannerCore } from "../../_components/section/banner-core";
import { BannerActive } from "../../_components/section/banner-active";
import { format } from "date-fns";

export const Client = () => {
  const [input, setInput] = useState({
    name: "",
    apply: "detail" as
      | "detail"
      | "categories"
      | "suppliers"
      | "pets"
      | "promos",
    selected: [] as string[],
    image: null as File | null,
    startDate: new Date() as Date | undefined,
    startTime: format(new Date(), "HH:mm") ?? "08:00",
    endDate: undefined as Date | undefined,
    endTime: format(new Date(), "HH:mm") ?? "08:00",
    isEnd: false as CheckedState | undefined,
  });

  const { mutate: createBanner, isPending: isCreating } = useCreateBanner();

  const handleCreateBanner = (e: MouseEvent) => {
    e.preventDefault();
    const body = new FormData();
    body.append("name", input.name);
    body.append("type", input.apply.toUpperCase());
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
    createBanner({ body });
  };

  const notSubmit =
    !input.name ||
    !input.image ||
    input.selected.length === 0 ||
    !input.startDate ||
    !input.startTime ||
    (input.isEnd && (!input.endDate || !input.endTime)) ||
    isCreating;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex items-center gap-2">
        <Button
          size={"icon"}
          variant={"secondary"}
          className="size-7 hover:bg-gray-200"
          asChild
        >
          <Link href="/banners">
            <ImageIcon className="size-5" />
          </Link>
        </Button>
        <ChevronRight className="size-4 text-gray-500" />
        <h1 className="text-xl font-semibold">Add Banner</h1>
      </div>
      <div className="w-full grid gap-6 grid-cols-7">
        <div className="col-span-4 w-full">
          <BannerCore input={input} setInput={setInput} />
        </div>
        <div className="col-span-3 w-full">
          <div className="flex flex-col gap-4 w-full">
            <BannerActive input={input} setInput={setInput} />
            <Button onClick={handleCreateBanner} disabled={notSubmit}>
              {isCreating ? <Loader2 className="animate-spin" /> : <Send />}
              Creat{isCreating ? "ing" : "e"} Banner{isCreating && "..."}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
