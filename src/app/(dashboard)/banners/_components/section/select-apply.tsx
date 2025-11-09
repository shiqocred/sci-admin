import React from "react";
import { ChevronDown } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OptionSelect } from "./_sub-section/option-select";
import { SelectItemsProps } from "../../_api";

interface SelectApplyProps {
  input: { apply: string };
  categories: SelectItemsProps[];
  suppliers: SelectItemsProps[];
  pets: SelectItemsProps[];
  promos: SelectItemsProps[];
  products: SelectItemsProps[];
  handleSelectApply: (id: string) => void;
}

export const SelectApply = ({
  input,
  categories,
  suppliers,
  pets,
  promos,
  products,
  handleSelectApply,
}: SelectApplyProps) => {
  const applyMap: Record<string, { title: string; data: any[] }> = {
    categories: { title: "Categories", data: categories },
    suppliers: { title: "Suppliers", data: suppliers },
    pets: { title: "Pets", data: pets },
    promos: { title: "Promos", data: promos },
    detail: { title: "Detail Product", data: products },
  };

  const { title, data } = applyMap[input.apply] || applyMap["detail"];

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="required">Target</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="justify-between bg-transparent hover:border-gray-400 hover:bg-transparent font-normal shadow-none border-gray-300 group"
            variant="outline"
          >
            Select {title}
            <ChevronDown className="group-data-[state=open]:rotate-180 transition-all" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder={`Search ${title}...`} />
            <CommandList>
              <CommandGroup>
                {data.map((item) => (
                  <OptionSelect
                    key={item.id}
                    input={input}
                    item={item}
                    handleSelectApply={handleSelectApply}
                  />
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
