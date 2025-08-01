import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, LucideIcon, X } from "lucide-react";
import React from "react";

interface ValueSelect {
  name: string;
  id: string;
}

interface ListSelectedProps {
  icon: LucideIcon;
  item: ValueSelect;
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

export const ListProductVariantSelected = ({
  icon: Icon,
  item,
  handleRemoveApply,
}: {
  icon: LucideIcon;
  item: any;
  handleRemoveApply: (v: any) => void;
}) => {
  return (
    <div
      key={item.id}
      className="flex justify-between items-center p-2 text-sm hover:bg-gray-100"
    >
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-2">
          <Icon className="size-3.5 text-gray-700 ml-2" />
          <ChevronRight className="size-3 text-gray-700" />
          <p>{item.name}</p>
        </div>
        <Separator className="my-2" />
        <div className="flex items-center gap-2">
          {item.variants.map((v: any) => (
            <div
              key={v.id}
              className="flex items-center gap-1 pl-2 pr-1 py-0.5 border rounded w-fit hover:bg-gray-200"
            >
              <p className="text-xs">{v.name}</p>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="size-4 rounded-full"
                onClick={() => handleRemoveApply(v.id)}
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
