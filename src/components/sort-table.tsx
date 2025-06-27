import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { TooltipText } from "@/providers/tooltip-provider";
import { Button } from "./ui/button";
import { ArrowDown, ArrowDownUp, ArrowUp, Check } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import { cn } from "@/lib/utils";

export const SortTable = ({
  order,
  sort,
  setSort,
  data,
}: {
  order: string;
  sort: string;
  setSort: any;
  data: { name: string; value: string }[];
}) => {
  return (
    <Popover>
      <TooltipText value="Sort">
        <PopoverTrigger asChild>
          <Button
            className="size-8 flex-none"
            variant={"outline"}
            size={"icon"}
          >
            <ArrowDownUp className="size-3.5" />
          </Button>
        </PopoverTrigger>
      </TooltipText>
      <PopoverContent className="p-0 w-fit min-w-32">
        <Command value={order}>
          <CommandList>
            <CommandGroup heading="Sort">
              {data.map((item) => (
                <CommandItem
                  key={item.value}
                  onSelect={(e) => setSort({ sort: e })}
                  value={item.value}
                  className="h-7 text-xs"
                >
                  <div
                    className={cn(
                      "size-3.5 rounded border flex items-center justify-center [&_svg]:opacity-0",
                      sort === item.value &&
                        "bg-primary border-primary [&_svg]:opacity-100"
                    )}
                  >
                    <Check className="size-3 text-white" />
                  </div>
                  {item.name}
                </CommandItem>
              ))}
              <CommandItem
                onSelect={(e) => setSort({ sort: e })}
                value="created"
                className="h-7 text-xs"
              >
                <div
                  className={cn(
                    "size-3.5 rounded border flex items-center justify-center [&_svg]:opacity-0",
                    sort === "created" &&
                      "bg-primary border-primary [&_svg]:opacity-100"
                  )}
                >
                  <Check className="size-3 text-white" />
                </div>
                Created
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={(e) => setSort({ order: e })}
                value="asc"
                className="h-7 text-xs"
              >
                <ArrowUp className="size-3.5" />
                Order first
              </CommandItem>
              <CommandItem
                onSelect={(e) => setSort({ order: e })}
                value="desc"
                className="h-7 text-xs"
              >
                <ArrowDown className="size-3.5" />
                Order first
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
