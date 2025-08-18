import React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { OptionSelect } from "./_sub-section/option-select";
import { Label } from "@/components/ui/label";
import { SelectPromoProps } from "../../_api";

export const SelectApply = ({
  input,
  products,
  handleSelectApply,
}: {
  input: any;
  products: SelectPromoProps[];
  handleSelectApply: (id: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>Products</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="justify-between bg-transparent hover:border-gray-400 hover:bg-transparent font-normal shadow-none border-gray-300 group"
            variant={"outline"}
          >
            Select Products
            <ChevronDown className="group-data-[state=open]:rotate-180 transition-all" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput />
            <CommandList>
              <CommandGroup>
                {products.map((item) => (
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
