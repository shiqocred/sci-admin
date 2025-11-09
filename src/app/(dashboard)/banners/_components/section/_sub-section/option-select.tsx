import { CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import React from "react";
import { SelectItemsProps } from "../../../_api";

interface OptionProps {
  item: SelectItemsProps;
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
      {item.name}
      <Check
        className={cn(
          "ml-auto",
          input.selected.includes(item.id) ? "flex" : "hidden"
        )}
      />
    </CommandItem>
  );
};
