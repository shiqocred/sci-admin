"use client";

import { MouseEvent, useCallback, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronRight, ImageIcon, Loader2, Send } from "lucide-react";
import { useCreateBanner } from "../_api";
import { BannerCore } from "../../_components/section/banner-core";
import { BannerActive } from "../../_components/section/banner-active";
import { BannerInput } from "../../_api/types";
import { formatDateTimeToISO } from "@/lib/utils";

const initialValue: BannerInput = {
  name: "",
  apply: "detail",
  selected: [],
  image: null,
  startDate: new Date(),
  startTime: format(new Date(), "HH:mm"),
  endDate: undefined,
  endTime: format(new Date(), "HH:mm"),
  isEnd: false,
};

export const Client = () => {
  const [input, setInput] = useState<BannerInput>(initialValue);

  const { mutate: createBanner, isPending: isCreating } = useCreateBanner();

  const handleCreateBanner = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append("name", input.name);
      formData.append("type", input.apply.toUpperCase());

      for (const item of input.selected) formData.append("apply", item);

      if (input.image) formData.append("image", input.image);

      if (input.startDate) {
        const start = formatDateTimeToISO(input.startTime, input.startDate);
        formData.append("start_banner", start);
      }

      if (input.isEnd && input.endDate) {
        const end = formatDateTimeToISO(input.endTime, input.endDate);
        formData.append("end_banner", end);
      }

      createBanner({ body: formData });
    },
    [input, createBanner]
  );

  const notSubmittable =
    isCreating ||
    !input.name ||
    !input.image ||
    !input.startDate ||
    !input.startTime ||
    input.selected.length === 0 ||
    (input.isEnd && (!input.endDate || !input.endTime));

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex w-full items-center gap-2">
        <Button
          asChild
          size="icon"
          variant="secondary"
          className="size-7 hover:bg-gray-200"
        >
          <Link href="/banners">
            <ImageIcon className="size-5" />
          </Link>
        </Button>
        <ChevronRight className="size-4 text-gray-500" />
        <h1 className="text-xl font-semibold">Create Banner</h1>
      </div>

      <div className="grid w-full grid-cols-7 gap-6">
        <div className="col-span-4">
          <BannerCore input={input} setInput={setInput} />
        </div>

        <div className="col-span-3">
          <div className="flex w-full flex-col gap-4">
            <BannerActive input={input} setInput={setInput} />
            <Button onClick={handleCreateBanner} disabled={notSubmittable}>
              {isCreating ? <Loader2 className="animate-spin" /> : <Send />}
              {isCreating ? " Creating..." : " Create Banner"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
