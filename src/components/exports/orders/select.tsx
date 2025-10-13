"use client";

import React, { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, pronoun } from "@/lib/utils";
import { Check, ChevronDown, ListCheck, ListX } from "lucide-react";

/* ---------------------- Types ---------------------- */
interface SelectPopoverProps {
  label: string;
  placeholder: string;
  data: { label: string; value: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  isVocal?: boolean;
  isProduct?: boolean;
}

/* ---------------------- Component ---------------------- */
export const SelectPopover = ({
  label,
  placeholder,
  data,
  selected,
  onChange,
  isVocal = false,
  isProduct = false,
}: SelectPopoverProps) => {
  /* ---------------------- Derived Data ---------------------- */
  const allSelected = selected.length === data.length && data.length > 0;
  const totalSelected = selected.length;

  const displayText = useMemo(() => {
    if (totalSelected === 0) return placeholder;
    if (allSelected) return `(${totalSelected}) All Selected`;
    return `${totalSelected} ${label}${pronoun(totalSelected, isVocal)} Selected`;
  }, [totalSelected, allSelected, label, isVocal, placeholder]);

  /* ---------------------- Handlers ---------------------- */
  const handleToggle = useCallback(
    (value: string) => {
      onChange(
        selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value]
      );
    },
    [onChange, selected]
  );

  const handleSelectAll = useCallback(() => {
    onChange(allSelected ? [] : data.map((i) => i.value));
  }, [allSelected, data, onChange]);

  const parseProductLabel = useCallback((name: string) => {
    const [sku, ...rest] = name.split(" ");
    return { sku, label: rest.join(" ") };
  }, []);

  /* ---------------------- Render ---------------------- */
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">{label}</Label>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="shadow-none border-gray-300 hover:border-gray-500 group text-xs h-8 justify-between hover:bg-transparent font-normal"
          >
            <span>{displayText}</span>
            <ChevronDown className="group-data-[state=open]:rotate-180 transition-transform size-3.5" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] max-h-[60vh] overflow-auto">
          <Command>
            <CommandList>
              <CommandGroup>
                {data.map(({ value, label }) => {
                  const isChecked = selected.includes(value);
                  return (
                    <CommandItem
                      key={value}
                      value={value}
                      className="text-xs"
                      onSelect={() => handleToggle(value)}
                    >
                      {isProduct ? (
                        (() => {
                          const { sku, label: productLabel } =
                            parseProductLabel(label);
                          return (
                            <span>
                              <strong>{sku}</strong> {productLabel}
                            </span>
                          );
                        })()
                      ) : (
                        <span>{label}</span>
                      )}
                      <Check
                        className={cn(
                          "size-3.5 ml-auto hidden",
                          isChecked && "flex"
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>

            <CommandSeparator />

            <CommandList>
              <CommandGroup>
                <CommandItem onSelect={handleSelectAll} className="text-xs">
                  {allSelected ? (
                    <>
                      <ListX className="size-3.5" />
                      Unselect All
                    </>
                  ) : (
                    <>
                      <ListCheck className="size-3.5" />
                      Select All
                    </>
                  )}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
