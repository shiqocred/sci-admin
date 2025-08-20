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

export const SelectApply = ({
  input,
  categories,
  suppliers,
  pets,
  promos,
  products,
  handleSelectApply,
}: {
  input: any;
  categories: any[];
  suppliers: any[];
  pets: any[];
  promos: any[];
  products: any[];
  handleSelectApply: (id: string) => void;
}) => {
  const tittleTrigger = () => {
    if (input.apply === "categories") return "Categories";
    if (input.apply === "suppliers") return "Suppliers";
    if (input.apply === "pets") return "Pets";
    if (input.apply === "promos") return "Promos";
    return "Detail Product";
  };
  return (
    <div className="flex flex-col gap-1.5">
      <Label>Target</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="justify-between bg-transparent hover:border-gray-400 hover:bg-transparent font-normal shadow-none border-gray-300 group"
            variant={"outline"}
          >
            Select {tittleTrigger()}
            <ChevronDown className="group-data-[state=open]:rotate-180 transition-all" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput />
            <CommandList>
              <CommandGroup>
                {input.apply === "categories" &&
                  categories.map((item) => (
                    <OptionSelect
                      key={item.id}
                      input={input}
                      item={item}
                      handleSelectApply={handleSelectApply}
                    />
                  ))}
                {input.apply === "suppliers" &&
                  suppliers.map((item) => (
                    <OptionSelect
                      key={item.id}
                      input={input}
                      item={item}
                      handleSelectApply={handleSelectApply}
                    />
                  ))}
                {input.apply === "pets" &&
                  pets.map((item) => (
                    <OptionSelect
                      key={item.id}
                      input={input}
                      item={item}
                      handleSelectApply={handleSelectApply}
                    />
                  ))}
                {input.apply === "promos" &&
                  promos.map((item) => (
                    <OptionSelect
                      key={item.id}
                      input={input}
                      item={item}
                      handleSelectApply={handleSelectApply}
                    />
                  ))}
                {input.apply === "detail" &&
                  products.map((item) => (
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
