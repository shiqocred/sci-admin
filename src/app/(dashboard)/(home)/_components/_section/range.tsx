"use client";

import React, { MouseEvent, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { parseAsString, useQueryStates } from "nuqs";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";
import { id } from "date-fns/locale";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { ArrowUpRight, ChevronDown, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
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
import { TooltipText } from "@/providers/tooltip-provider";

import { MonthModeSection } from "./_mode/month";
import { RangeLoading } from "../_loading/_partial/range";
import { CustomersRange, useGetDashboardRange } from "../../_api";
import { DateRange } from "react-day-picker";

const chartConfig = {
  income: { label: "Revenue", color: "var(--color-green-300)" },
  order: { label: "Order", color: "var(--color-green-500)" },
} satisfies ChartConfig;

/* -------------------------------------------------------------------------- */
/* Utils                                                                      */
/* -------------------------------------------------------------------------- */

function parseISODate(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const CURRENT_YEAR = new Date().getFullYear();
const START_YEAR = 2023;

const YEARS = Array.from(
  { length: CURRENT_YEAR - START_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i,
);

const monthStart = startOfMonth(new Date());
const monthEnd = endOfMonth(new Date());

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export const DashboardRange = () => {
  /* ------------------------------ Query State ------------------------------ */
  const [{ modeOrder, from, to }, setQuery] = useQueryStates({
    modeOrder: parseAsString.withDefault("year"),
    from: parseAsString.withDefault(CURRENT_YEAR.toString()),
    to: parseAsString.withDefault(CURRENT_YEAR.toString()),
  });

  /* ------------------------------ Local State ------------------------------ */
  const [open, setOpen] = useState(false);

  const [rangeYear, setRangeYear] = useState({
    from: CURRENT_YEAR,
    to: CURRENT_YEAR,
  });

  const [rangeMonth, setRangeMonth] = useState<DateRange | undefined>({
    from: monthStart,
    to: monthEnd,
  });

  /* ------------------------------ Derived Date ----------------------------- */
  const fromDate =
    modeOrder === "year"
      ? startOfYear(new Date(Number(from), 0, 1))
      : parseISODate(from);

  const toDate =
    modeOrder === "year"
      ? endOfYear(new Date(Number(to), 0, 1))
      : parseISODate(to);

  /* ------------------------------ API Call -------------------------------- */
  const { data: dataRange, isPending } = useGetDashboardRange({
    mode: modeOrder,
    from: fromDate ? startOfDay(fromDate).toISOString() : "",
    to: toDate ? endOfDay(toDate).toISOString() : "",
  });

  /* ------------------------------ Helpers --------------------------------- */
  const labelPopover = useMemo(() => {
    if (modeOrder === "year") return `${from} - ${to}`;
    if (!fromDate || !toDate) return "-";
    return `${format(fromDate, "PP", { locale: id })} - ${format(toDate, "PP", {
      locale: id,
    })}`;
  }, [modeOrder, from, to, fromDate, toDate]);

  const isDisabled = useMemo(() => {
    if (modeOrder === "year") {
      return Number(from) === CURRENT_YEAR && Number(to) === CURRENT_YEAR;
    }
    return (
      fromDate?.getTime() === monthStart.getTime() &&
      toDate?.getTime() === monthEnd.getTime()
    );
  }, [modeOrder, from, to, fromDate, toDate]);

  /* ------------------------------ Handlers -------------------------------- */
  const handleMode = useCallback(
    (_: MouseEvent, mode: string) => {
      if (mode === "year") {
        setQuery({
          modeOrder: "year",
          from: CURRENT_YEAR.toString(),
          to: CURRENT_YEAR.toString(),
        });
        setRangeYear({ from: CURRENT_YEAR, to: CURRENT_YEAR });
      } else {
        setQuery({
          modeOrder: "month",
          from: monthStart.toISOString(),
          to: monthEnd.toISOString(),
        });
        setRangeMonth({ from: monthStart, to: monthEnd });
      }
    },
    [setQuery],
  );

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
          from: rangeMonth?.from.toISOString(),
          to: rangeMonth?.to.toISOString(),
        });
      }
      setOpen(false);
    },
    [modeOrder, rangeYear, rangeMonth, setQuery],
  );

  const handleReset = useCallback(() => {
    handleMode({} as MouseEvent, modeOrder);
  }, [handleMode, modeOrder]);

  /* ------------------------------ Render ---------------------------------- */
  if (isPending) return <RangeLoading />;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Separator className="flex-auto" />

        <ButtonGroup>
          {(["year", "month"] as const).map((type) => (
            <React.Fragment key={type}>
              {type === "month" && <ButtonGroupSeparator />}
              <Button
                size="sm"
                variant="outline"
                disabled={modeOrder === type}
                onClick={(e) => handleMode(e, type)}
              >
                {type}
              </Button>
            </React.Fragment>
          ))}
        </ButtonGroup>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">
              {labelPopover}
              <ChevronDown className="ml-2 size-4" />
            </Button>
          </PopoverTrigger>

          {modeOrder === "month" ? (
            <MonthModeSection
              rangeMonth={rangeMonth}
              setRangeMonth={setRangeMonth}
              setQuery={setQuery}
              setOpen={setOpen}
              isDisabled={isDisabled}
            />
          ) : (
            <PopoverContent className="flex gap-3">
              {(["from", "to"] as const).map((t) => (
                <Select
                  key={t}
                  value={rangeYear[t].toString()}
                  onValueChange={(v) =>
                    setRangeYear((p) => ({ ...p, [t]: Number(v) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
              <Button onClick={handleConfirm}>Confirm</Button>
            </PopoverContent>
          )}
        </Popover>

        {!isDisabled && (
          <Button size="sm" variant="outline" onClick={handleReset}>
            <XCircle className="mr-1 size-4" />
            Reset
          </Button>
        )}

        <Separator className="flex-auto" />
      </div>

      {/* Chart + Customers */}
      <div className="grid grid-cols-11 gap-6 w-full">
        <Card className="col-span-7 p-0 gap-0">
          <CardHeader className="border-b !p-4 flex flex-row gap-1">
            <div className="flex flex-col gap-1 w-full">
              <CardTitle>Orders Summary</CardTitle>
              <CardDescription>
                Showing total orders for the selected period
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
                Showing top customers for the selected period
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
