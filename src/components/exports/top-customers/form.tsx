"use client";

import React, {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";
import { CustomerExportProps } from "./_api";
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
import { subMonths } from "date-fns";
import { cn } from "@/lib/utils";

interface ExportFormProps {
  suppliers: string[];
  setSuppliers: Dispatch<SetStateAction<string[]>>;
  type: "product" | "supplier";
  setType: Dispatch<SetStateAction<"product" | "supplier">>;
  dataFilter?: CustomerExportProps;
  products: string[];
  setProducts: Dispatch<SetStateAction<string[]>>;
  isOpenDate: boolean;
  setIsOpenDate: Dispatch<SetStateAction<boolean>>;
  formatRange: string;
  rangeDate?: DateRange;
  setRangeDate: Dispatch<SetStateAction<DateRange | undefined>>;
  handleDownload: (e: MouseEvent) => void;
  isMarketing?: boolean;
}

export const ExportForm = ({
  suppliers,
  setSuppliers,
  type,
  setType,
  dataFilter,
  products,
  setProducts,
  isOpenDate,
  setIsOpenDate,
  formatRange,
  rangeDate,
  setRangeDate,
  handleDownload,
  isMarketing = false,
}: ExportFormProps) => {
  /* ---------------------- Memos & Callbacks ---------------------- */
  const disableDownload = useMemo(
    () =>
      (type === "supplier" && suppliers.length === 0) ||
      (type === "product" && products.length === 0),
    [suppliers, products]
  );

  const handleTabChange = useCallback(
    (val: "product" | "supplier") => {
      setType(val);
      if (
        val === "supplier" &&
        suppliers.length === 0 &&
        dataFilter?.suppliers
      ) {
        setSuppliers(dataFilter?.suppliers.map((r) => r.value));
      }
    },
    [setType, setSuppliers, suppliers.length, dataFilter]
  );

  const handleResetDate = useCallback(
    () => setRangeDate(undefined),
    [setRangeDate]
  );
  const handleCloseDate = useCallback(
    () => setIsOpenDate(false),
    [setIsOpenDate]
  );

  const supplierData = dataFilter?.suppliers ?? [];
  const productData = dataFilter?.products ?? [];

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
