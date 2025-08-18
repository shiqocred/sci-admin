import { CommandItem } from "@/components/ui/command";
import { cn, sizesImage } from "@/lib/utils";
import { Check } from "lucide-react";
import Image from "next/image";
import React from "react";
import { SelectPromoProps } from "../../../_api";
import { Badge } from "@/components/ui/badge";

interface OptionProps {
  item: SelectPromoProps;
  input: any;
  handleSelectApply: (item: any) => void;
}

export const OptionSelect = ({
  item,
  input,
  handleSelectApply,
}: OptionProps) => {
  return (
    <CommandItem onSelect={() => handleSelectApply(item)}>
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
      <Badge
        className={cn(
          "text-black font-normal",
          item.status ? "bg-green-300" : "bg-gray-300"
        )}
      >
        {item.status ? "Publish" : "Draft"}
      </Badge>
      <Check
        className={cn(
          "ml-auto",
          input.selected.includes(item.id) ? "opacity-100" : "opacity-0"
        )}
      />
    </CommandItem>
  );
};
