import { Button } from "@/components/ui/button";
import { ChevronRight, LucideIcon, X } from "lucide-react";
import React from "react";
import { SelectItemsProps } from "../../../_api";

interface ListSelectedProps {
  icon: LucideIcon;
  item: SelectItemsProps;
  handleRemoveApply: () => void;
}

export const ListSelected = ({
  icon: Icon,
  item,
  handleRemoveApply,
}: ListSelectedProps) => {
  return (
    <div className="flex justify-between items-center p-2 text-sm hover:bg-gray-100">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-gray-700 ml-2" />
        <ChevronRight className="size-3 text-gray-700" />
        <p>{item.name}</p>
      </div>
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
