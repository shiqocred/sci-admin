import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";
import React from "react";
import { SelectPromoProps } from "../../../_api";
import { cn, sizesImage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ListSelectedProps {
  item: SelectPromoProps;
  handleRemoveApply: () => void;
}

export const ListSelected = ({
  item,
  handleRemoveApply,
}: ListSelectedProps) => {
  return (
    <div className="flex justify-between items-center p-2 text-sm hover:bg-gray-100 gap-2">
      <div className="flex items-center gap-2 w-full">
        <div className="relative size-10 border border-gray-200 rounded overflow-hidden flex-none">
          <Image
            src={item.image ?? "/images/logo-sci.png"}
            alt={item.name}
            sizes={sizesImage}
            fill
            className="object-cover"
          />
        </div>
        <p className="w-full text-wrap">{item.name}</p>
      </div>
      <Badge
        className={cn(
          "text-black font-normal flex-none",
          item.status ? "bg-green-300" : "bg-gray-300"
        )}
      >
        {item.status ? "Publish" : "Draft"}
      </Badge>
      <Button
        className="size-fit p-1 flex-none text-gray-500 hover:bg-gray-200"
        variant={"ghost"}
        size={"icon"}
        onClick={handleRemoveApply}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
};
