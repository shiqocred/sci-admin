"use client";

import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import {
  endOfDay,
  endOfMonth,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfYear,
  subMonths,
  subWeeks,
} from "date-fns";
import { ArrowUpRight, CalendarIcon, ChevronDown, XCircle } from "lucide-react";
import Link from "next/link";
import { parseAsString, useQueryStates } from "nuqs";
import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DateRange } from "react-day-picker";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { CustomersRange, useGetDashboardRange } from "../../_api";
import { id } from "date-fns/locale";

// 🧠 Constants
const chartConfig = {
  income: {
    label: "Revenue",
    color: "var(--color-green-300)",
  },
  order: {
    label: "Order",
    color: "var(--color-green-500)",
  },
} satisfies ChartConfig;

const START_YEAR = 2023;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from(
  { length: CURRENT_YEAR - START_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i
);

const dateStartMonth = startOfMonth(new Date());
const dateEndMonth = endOfMonth(new Date());

export const DashboardRange = () => {
  // 🔹 URL query state
  const [{ modeOrder, from, to }, setQuery] = useQueryStates({
    modeOrder: parseAsString.withDefault("year"),
    from: parseAsString.withDefault(CURRENT_YEAR.toString()),
    to: parseAsString.withDefault(CURRENT_YEAR.toString()),
  });

  // 🔹 Local UI state
  const [open, setOpen] = useState(false);
  const [openQuick, setOpenQuick] = useState(false);
  const [rangeMonth, setRangeMonth] = useState<DateRange>();
  const [rangeYear, setRangeYear] = useState({
    from: CURRENT_YEAR,
    to: CURRENT_YEAR,
  });

  const decodeFrom = decodeURIComponent(from);
  const decodeTo = decodeURIComponent(to);

  // 🔹 Detect if current range is already at default
  const isDisabled = useMemo(() => {
    if (modeOrder === "month") {
      return (
        startOfMonth(new Date()).getTime() === new Date(decodeFrom).getTime() &&
        startOfDay(endOfMonth(new Date())).getTime() ===
          new Date(decodeTo).getTime()
      );
    }
    return (
      modeOrder === "year" &&
      CURRENT_YEAR === Number(from) &&
      CURRENT_YEAR === Number(to)
    );
  }, [modeOrder, decodeFrom, decodeTo, from, to]);

  // 🔹 Format range label helper
  const formatRangeLabel = useCallback((from: Date, to: Date) => {
    return `${format(from, "PP", { locale: id })} - ${format(to, "PP", {
      locale: id,
    })}`;
  }, []);

  // 🔹 Label for popover button
  const labelPopover = useMemo(() => {
    return modeOrder === "month"
      ? formatRangeLabel(new Date(decodeFrom), new Date(decodeTo))
      : `${from} - ${to}`;
  }, [modeOrder, decodeFrom, decodeTo, from, to, formatRangeLabel]);

  const labelCurrent = useMemo(() => {
    return rangeMonth?.from && rangeMonth?.to
      ? formatRangeLabel(rangeMonth.from, rangeMonth.to)
      : "";
  }, [rangeMonth, formatRangeLabel]);

  // 🔹 Fetch data
  const { data: dataRange } = useGetDashboardRange({
    mode: modeOrder,
    from:
      modeOrder === "year"
        ? startOfYear(new Date(Number(from), 0, 1)).toISOString()
        : startOfDay(new Date(decodeFrom)).toISOString(),
    to:
      modeOrder === "year"
        ? endOfYear(new Date(Number(to), 0, 1)).toISOString()
        : endOfDay(new Date(decodeTo)).toISOString(),
  });

  // 🔹 Handlers
  const handleConfirm = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      if (modeOrder === "year") {
        setQuery({
          from: rangeYear.from.toString(),
          to: rangeYear.to.toString(),
        });
      } else if (rangeMonth?.from && rangeMonth?.to) {
        setQuery({
          from: rangeMonth.from.toISOString(),
          to: rangeMonth.to.toISOString(),
        });
      }
      setOpen(false);
    },
    [modeOrder, rangeMonth, rangeYear, setQuery]
  );

  const handleReset = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      if (modeOrder === "year") {
        setQuery({
          from: CURRENT_YEAR.toString(),
          to: CURRENT_YEAR.toString(),
        });
      } else {
        setQuery({
          from: dateStartMonth.toISOString(),
          to: dateEndMonth.toISOString(),
        });
      }
    },
    [modeOrder, setQuery]
  );

  const handleMode = useCallback(
    (e: MouseEvent, type: "year" | "month") => {
      e.preventDefault();
      if (type === "year") {
        setQuery({
          modeOrder: "year",
          from: CURRENT_YEAR.toString(),
          to: CURRENT_YEAR.toString(),
        });
        setRangeYear({ from: CURRENT_YEAR, to: CURRENT_YEAR });
      } else {
        setQuery({
          modeOrder: "month",
          from: dateStartMonth.toISOString(),
          to: dateEndMonth.toISOString(),
        });
        setRangeMonth({ from: dateStartMonth, to: dateEndMonth });
      }
    },
    [setQuery]
  );

  const handleQuick = useCallback(
    (type: "year" | "six" | "three" | "one" | "week") => {
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
    },
    []
  );

  // 🔹 Sync state with URL
  useEffect(() => {
    if (from && to && modeOrder === "month") {
      setRangeMonth({ from: new Date(decodeFrom), to: new Date(decodeTo) });
    }
  }, [from, to, modeOrder, decodeFrom, decodeTo]);

  // 🔹 UI
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Separator className="flex-auto" />
        <div className="flex items-center gap-4 ml-auto">
          <ButtonGroup className="border-gray-300">
            {["year", "month"].map((type) => (
              <React.Fragment key={type}>
                {type === "month" && (
                  <ButtonGroupSeparator className="bg-gray-300 !w-px" />
                )}
                <Button
                  className={cn(
                    "border-gray-300 shadow-none disabled:opacity-100 hover:bg-gray-100",
                    modeOrder === type && "bg-gray-100"
                  )}
                  variant="outline"
                  size="sm"
                  disabled={modeOrder === type}
                  onClick={(e) => handleMode(e, type as "year" | "month")}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              </React.Fragment>
            ))}
          </ButtonGroup>

          {/* Range Picker */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="shadow-none border-gray-300 !p-0 gap-0 hover:bg-white group overflow-hidden"
              >
                <p className="px-3">{labelPopover}</p>
                <Separator orientation="vertical" />
                <div className="h-full px-3 flex items-center group-hover:bg-gray-100">
                  <ChevronDown className="group-data-[state=open]:rotate-180 transition-all" />
                </div>
              </Button>
            </PopoverTrigger>

            {/* Month Picker */}
            {modeOrder === "month" ? (
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
                                    key as
                                      | "year"
                                      | "six"
                                      | "three"
                                      | "one"
                                      | "week"
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
            ) : (
              // Year Picker
              <PopoverContent
                className="p-3 flex flex-col gap-3 w-auto"
                sideOffset={10}
                align="end"
                alignOffset={isDisabled ? -10 : -60}
              >
                <div className="grid grid-cols-3 px-3 py-1.5 gap-3">
                  {(["from", "to"] as const).map((type) => (
                    <div key={type} className="mx-auto flex flex-col gap-0.5">
                      <p className="text-sm font-semibold capitalize">
                        {type}:
                      </p>
                      <Select
                        value={rangeYear[type].toString()}
                        onValueChange={(e) =>
                          setRangeYear((prev) => ({
                            ...prev,
                            [type]: Number(e),
                          }))
                        }
                      >
                        <SelectTrigger className="border-gray-300 shadow-none focus-visible:ring-0 data-[state=open]:border-gray-500 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {YEARS.filter((y) =>
                            type === "to" ? y >= rangeYear.from : true
                          ).map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  <Button
                    className="border mt-auto text-xs"
                    size="sm"
                    onClick={handleConfirm}
                  >
                    Confirm
                  </Button>
                </div>
              </PopoverContent>
            )}
          </Popover>

          {/* Reset Button */}
          {!isDisabled && (
            <Button
              className="border-gray-300 shadow-none hover:bg-gray-100"
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <XCircle />
              Reset
            </Button>
          )}
        </div>
        <Separator className="flex-auto" />
      </div>

      {/* Chart + Customers */}
      <div className="grid grid-cols-11 gap-6 w-full">
        <Card className="col-span-7 p-0 gap-0">
          <CardHeader className="border-b !p-4 flex flex-row gap-1">
            <div className="flex flex-col gap-1 w-full">
              <CardTitle>Summary Orders</CardTitle>
              <CardDescription>
                Showing total orders for selected period
              </CardDescription>
            </div>
            <div className="flex flex-col items-end flex-none">
              <p className="font-semibold text-sm whitespace-nowrap">
                {dataRange?.data.total.amount}
              </p>
              <p className="text-xs whitespace-nowrap">
                for {dataRange?.data.total.order}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <AreaChart data={dataRange?.data?.orders ?? []}>
                <defs>
                  <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-income)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-income)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillOrder" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-order)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-order)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) =>
                    value && modeOrder === "year"
                      ? format(new Date(value), "MMM yy")
                      : format(new Date(value), "MMM dd, yy")
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) =>
                        value && modeOrder === "year"
                          ? format(new Date(value), "MMMM yyyy")
                          : format(new Date(value), "PP")
                      }
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="order"
                  type="natural"
                  fill="url(#fillOrder)"
                  stroke="var(--color-order)"
                />
                <Area
                  dataKey="income"
                  type="natural"
                  fill="url(#fillIncome)"
                  stroke="var(--color-income)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="w-full col-span-4">
          <Card className="col-span-4 p-0 gap-0">
            <CardHeader className="border-b !p-4 flex flex-col gap-1">
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>
                Showing top customers for selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dataRange?.data?.customers?.length ? (
                <ol className="divide-y text-sm">
                  {dataRange.data.customers.map((c: CustomersRange) => (
                    <li key={c.id}>
                      <TooltipText value={c.name}>
                        <Link
                          href={`/customers/${c.id}`}
                          className="flex items-center py-2 group"
                        >
                          <p className="w-full group-hover:underline underline-offset-2 line-clamp-1">
                            {c.name}
                          </p>
                          <p className="w-60 flex justify-center">{c.amount}</p>
                          <ArrowUpRight className="size-3 flex-none group-hover:-translate-x-1 group-hover:translate-y-1 transition-all" />
                        </Link>
                      </TooltipText>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="flex items-center justify-center py-16 text-sm font-medium">
                  <p>No Customers Record.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Separator />
    </div>
  );
};
