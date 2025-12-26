import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { endOfMonth, format, subMonths, subWeeks } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { ParserBuilder, SetValues } from "nuqs";
import React, {
  SetStateAction,
  Dispatch,
  useCallback,
  useMemo,
  useState,
  MouseEvent,
  useEffect,
} from "react";
import { DateRange } from "react-day-picker";

type NuqsValue = string | string[] | undefined;

interface MonthModeSection {
  decodeFrom: string;
  decodeTo: string;
  isDisabled: boolean;
  rangeMonth: DateRange | undefined;
  setRangeMonth: Dispatch<SetStateAction<DateRange | undefined>>;
  setQuery: SetValues<{
    modeOrder: Omit<ParserBuilder<string>, "parseServerSide"> & {
      readonly defaultValue: string;
      parseServerSide(value: NuqsValue): string;
    };
    from: Omit<ParserBuilder<string>, "parseServerSide"> & {
      readonly defaultValue: string;
      parseServerSide(value: NuqsValue): string;
    };
    to: Omit<ParserBuilder<string>, "parseServerSide"> & {
      readonly defaultValue: string;
      parseServerSide(value: NuqsValue): string;
    };
  }>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const MonthModeSection = ({
  decodeFrom,
  decodeTo,
  isDisabled,
  rangeMonth,
  setRangeMonth,
  setQuery,
  setOpen,
}: MonthModeSection) => {
  const [openQuick, setOpenQuick] = useState(false);
  const formatRangeLabel = useCallback((from: Date, to: Date) => {
    return `${format(from, "PP", { locale: id })} - ${format(to, "PP", {
      locale: id,
    })}`;
  }, []);
  const labelCurrent = useMemo(() => {
    return rangeMonth?.from && rangeMonth?.to
      ? formatRangeLabel(rangeMonth.from, rangeMonth.to)
      : "";
  }, [rangeMonth, formatRangeLabel]);
  const handleQuick = (type: "year" | "six" | "three" | "one" | "week") => {
    const now = new Date();
    const newRange: DateRange = (() => {
      switch (type) {
        case "year":
          return { from: subMonths(now, 12), to: now };
        case "six":
          return { from: subMonths(now, 6), to: now };
        case "three":
          return { from: subMonths(now, 3), to: now };
        case "one":
          return { from: subMonths(now, 1), to: now };
        default:
          return { from: subWeeks(now, 1), to: now };
      }
    })();

    setRangeMonth(newRange);
    setOpenQuick(false);
  };

  const handleConfirm = (e: MouseEvent) => {
    e.preventDefault();

    setQuery({
      from: rangeMonth?.from?.toISOString(),
      to: rangeMonth?.to?.toISOString(),
    });
    setOpen(false);
  };

  useEffect(() => {
    setRangeMonth({ from: new Date(decodeFrom), to: new Date(decodeTo) });
  }, [decodeFrom, decodeTo]);
  return (
    <PopoverContent
      className="p-3 flex flex-col gap-3 w-auto"
      sideOffset={10}
      align="end"
      alignOffset={isDisabled ? -65 : -115}
    >
      <h5 className="font-semibold text-base">Pick a date range</h5>
      <div className="flex items-center gap-3">
        <div className="h-8 border flex items-center rounded gap-2 w-full text-sm px-3 border-gray-300">
          <CalendarIcon className="size-3" />
          <p>{labelCurrent}</p>
        </div>
        <Popover open={openQuick} onOpenChange={setOpenQuick}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              className="size-8 [&_svg]:size-3.5 rounded border-gray-300"
              variant="outline"
            >
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-40" align="end">
            <Command>
              <CommandList>
                <CommandGroup>
                  {[
                    ["year", "Last year"],
                    ["six", "Last 6 months"],
                    ["three", "Last 3 months"],
                    ["one", "Last month"],
                    ["week", "Last week"],
                  ].map(([key, label]) => (
                    <CommandItem
                      key={key}
                      onSelect={() =>
                        handleQuick(
                          key as "year" | "six" | "three" | "one" | "week",
                        )
                      }
                    >
                      {label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button size="sm" className="rounded" onClick={handleConfirm}>
          Confirm
        </Button>
      </div>
      <div className="border border-gray-300 rounded">
        <Calendar
          mode="range"
          numberOfMonths={2}
          disabled={{ after: endOfMonth(new Date()) }}
          defaultMonth={subMonths(new Date(), 1)}
          onSelect={setRangeMonth}
          selected={rangeMonth}
        />
      </div>
    </PopoverContent>
  );
};
