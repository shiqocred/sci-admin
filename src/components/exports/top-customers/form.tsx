"use client";

import { MouseEvent, useCallback, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { SelectPopover } from "./select";
import {
  CalendarCheck,
  ChartNoAxesGantt,
  ChevronDown,
  DownloadCloud,
  Store,
  X,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { endOfDay, format, startOfDay, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { id } from "date-fns/locale";
import { DownloadExportType, GetExportFiltersType } from ".";

const formatDateRange = (range?: DateRange) => {
  if (!range?.from && !range?.to) return "All Period";
  const { from, to } = range;
  if (from && to) {
    return from.getTime() === to.getTime()
      ? format(from, "P", { locale: id })
      : `${format(from, "P", { locale: id })} - ${format(to, "P", {
          locale: id,
        })}`;
  }
  const date = from ?? to;
  return date ? format(date, "P", { locale: id }) : "All Period";
};

interface ExportFormProps {
  data: GetExportFiltersType;
  exportData: DownloadExportType;
  isMarketing?: boolean;
}

export const ExportForm = ({
  data,
  exportData,
  isMarketing = false,
}: ExportFormProps) => {
  const [type, setType] = useState<"product" | "supplier">("product");
  const [suppliers, setSuppliers] = useState<string[]>(
    data.data.suppliers.map((i) => i.value) ?? [],
  );
  const [products, setProducts] = useState<string[]>(
    data.data.products.map((i) => i.value) ?? [],
  );
  const [isOpenDate, setIsOpenDate] = useState(false);
  const [rangeDate, setRangeDate] = useState<DateRange>();

  /* ---------------------- Memos & Callbacks ---------------------- */
  const disableDownload = useMemo(
    () =>
      (type === "supplier" && suppliers.length === 0) ||
      (type === "product" && products.length === 0),
    [suppliers, products],
  );

  const handleTabChange = (val: "product" | "supplier") => {
    setType(val);
    if (val === "supplier" && suppliers.length === 0 && data.data.suppliers) {
      setSuppliers(data.data.suppliers.map((r) => r.value));
    }
  };

  const handleResetDate = useCallback(
    () => setRangeDate(undefined),
    [setRangeDate],
  );
  const handleCloseDate = useCallback(
    () => setIsOpenDate(false),
    [setIsOpenDate],
  );

  const supplierData = data.data.suppliers ?? [];
  const productData = data.data.products ?? [];

  const formatRange = useMemo(() => formatDateRange(rangeDate), [rangeDate]);

  const getIsAll = (arr: string[], compare?: string[]) =>
    compare ? arr.length === compare.length : false;

  const isAllProduct =
    type === "supplier" ||
    getIsAll(
      products,
      data.data.products?.map((i) => i.value),
    );

  const isAllSupplier =
    type === "product" ||
    getIsAll(
      suppliers,
      data.data.suppliers?.map((i) => i.value),
    );

  /* ---------------------- Handle Download ---------------------- */
  const handleDownload = (e: MouseEvent) => {
    e.preventDefault();
    const body = {
      suppliers: isAllSupplier ? [] : suppliers,
      products: isAllProduct ? [] : products,
      periodStart: rangeDate?.from
        ? startOfDay(rangeDate.from).toISOString()
        : null,
      periodEnd: rangeDate?.to ? endOfDay(rangeDate.to).toISOString() : null,
      isAllPeriod: !rangeDate?.from && !rangeDate?.to,
      isSameDate: rangeDate?.from?.getTime() === rangeDate?.to?.getTime(),
      isAllProduct,
      isAllSupplier,
      type,
    };

    exportData(
      { body },
      {
        onSuccess: (res) => {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement("a");
          link.href = url;
          link.download = `REPORT TOP CUSTOMERS - ${format(new Date(), "P_HH_mm_ss", { locale: id })}.xlsx`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        },
      },
    );
  };

  /* ---------------------- JSX ---------------------- */
  return (
    <div className={cn("flex flex-col gap-3", isMarketing && "h-full")}>
      <Tabs
        value={type}
        onValueChange={(val) => handleTabChange(val as "product" | "supplier")}
      >
        <TabsList className="w-full">
          <TabsTrigger value="product" className="w-full text-xs">
            <ChartNoAxesGantt className="size-3" /> Product
          </TabsTrigger>
          <TabsTrigger value="supplier" className="w-full text-xs">
            <Store className="size-3" /> Supplier
          </TabsTrigger>
        </TabsList>

        <TabsContent value="product">
          <SelectPopover
            label="Product"
            placeholder="Select Product..."
            data={productData}
            selected={products}
            onChange={setProducts}
          />
        </TabsContent>

        <TabsContent value="supplier">
          <SelectPopover
            label="Supplier"
            placeholder="Select Supplier..."
            data={supplierData}
            selected={suppliers}
            onChange={setSuppliers}
          />
        </TabsContent>
      </Tabs>

      {/* PERIOD */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Period</Label>
        <Popover open={isOpenDate} onOpenChange={setIsOpenDate}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="shadow-none border-gray-300 hover:border-gray-500 group text-xs h-8 justify-between hover:bg-transparent font-normal"
            >
              <span>{formatRange}</span>
              <ChevronDown className="group-data-[state=open]:rotate-180 transition-all size-3.5" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-auto p-0"
            align={isMarketing ? "center" : "end"}
          >
            <Calendar
              numberOfMonths={2}
              mode="range"
              defaultMonth={subMonths(new Date(), 1)}
              disabled={{ after: new Date() }}
              selected={rangeDate}
              onSelect={setRangeDate}
            />

            <div className="flex items-center gap-3 border-t p-3 justify-end">
              <Button className="text-xs h-8" onClick={handleResetDate}>
                <CalendarCheck className="size-3.5" />
                Reset / All Period
              </Button>
              <Button className="text-xs h-8" onClick={handleCloseDate}>
                <X className="size-3.5" />
                Close
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* DOWNLOAD */}
      <Button
        className={cn("text-xs h-8", isMarketing && "mt-auto")}
        onClick={handleDownload}
        disabled={disableDownload}
      >
        <DownloadCloud className="size-3.5" />
        Download
      </Button>
    </div>
  );
};
