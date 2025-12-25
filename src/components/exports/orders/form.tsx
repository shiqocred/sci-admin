"use client";

import React, { MouseEvent, useCallback, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { SelectPopover } from "./select";
import {
  CalendarCheck,
  ChevronDown,
  Crown,
  DownloadCloud,
  UserRound,
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
import { DATA_ROLES, DATA_STATUSES } from "../libs/utils";
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

/* ---------------------- Component ---------------------- */
export const ExportForm = ({
  data,
  exportData,
  isMarketing = false,
}: ExportFormProps) => {
  const [type, setType] = useState<"customer" | "role">("customer");
  const [statuses, setStatuses] = useState<string[]>(() =>
    DATA_STATUSES.map((i) => i.value),
  );
  const [roles, setRoles] = useState<string[]>([]);
  const [customers, setCustomers] = useState<string[]>(
    data.data.customers.map((i) => i.value),
  );
  const [products, setProducts] = useState<string[]>(
    data.data.products.map((i) => i.value),
  );
  const [isOpenDate, setIsOpenDate] = useState(false);
  const [rangeDate, setRangeDate] = useState<DateRange>();

  /* ---------------------- Memos & Callbacks ---------------------- */
  const disableDownload = useMemo(
    () =>
      statuses.length === 0 ||
      (type === "role" && roles.length === 0) ||
      (type === "customer" && customers.length === 0) ||
      products.length === 0,
    [statuses, type, roles, customers, products],
  );

  const formatRange = useMemo(() => formatDateRange(rangeDate), [rangeDate]);

  const getIsAll = (arr: string[], compare?: string[]) =>
    compare ? arr.length === compare.length : false;

  const isAllRole =
    type === "customer" ||
    getIsAll(
      roles,
      DATA_ROLES.map((i) => i.value),
    );
  const isAllStatus = getIsAll(
    statuses,
    DATA_STATUSES.map((i) => i.value),
  );
  const isAllCustomer =
    type === "role" ||
    getIsAll(
      customers,
      data.data.customers?.map((i) => i.value),
    );
  const isAllProduct = getIsAll(
    products,
    data.data.products?.map((i) => i.value),
  );

  /* ---------------------- Handle Download ---------------------- */
  const handleDownload = (e: MouseEvent) => {
    e.preventDefault();
    const body = {
      statuses: isAllStatus ? [] : statuses,
      customers: isAllCustomer ? [] : customers,
      roles: isAllRole ? [] : roles,
      products: isAllProduct ? [] : products,
      periodStart: rangeDate?.from
        ? startOfDay(rangeDate.from).toISOString()
        : null,
      periodEnd: rangeDate?.to ? endOfDay(rangeDate.to).toISOString() : null,
      isAllPeriod: !rangeDate?.from && !rangeDate?.to,
      isSameDate: rangeDate?.from?.getTime() === rangeDate?.to?.getTime(),
      isAllRole,
      isAllStatus,
      isAllCustomer,
      isAllProduct,
      type,
    };

    exportData(
      { body },
      {
        onSuccess: (res) => {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement("a");
          link.href = url;
          link.download = `REPORT DETAILS - ${format(new Date(), "P_HH_mm_ss", { locale: id })}.xlsx`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        },
      },
    );
  };

  const handleTabChange = useCallback(
    (val: "customer" | "role") => {
      setType(val);
      if (val === "role" && roles.length === 0) {
        setRoles(DATA_ROLES.map((r) => r.value));
      }
    },
    [setType, setRoles, roles.length, DATA_ROLES],
  );

  const handleResetDate = useCallback(
    () => setRangeDate(undefined),
    [setRangeDate],
  );
  const handleCloseDate = useCallback(
    () => setIsOpenDate(false),
    [setIsOpenDate],
  );

  const customerData = data.data.customers ?? [];
  const productData = data.data.products ?? [];

  /* ---------------------- JSX ---------------------- */
  return (
    <div className="flex flex-col gap-3">
      {/* STATUS */}
      <SelectPopover
        label="Status"
        placeholder="Select Status Order..."
        data={DATA_STATUSES}
        selected={statuses}
        onChange={setStatuses}
        isVocal
      />

      {/* CUSTOMER / ROLE */}
      <Tabs
        value={type}
        onValueChange={(val) => handleTabChange(val as "customer" | "role")}
      >
        <TabsList className="w-full">
          <TabsTrigger value="customer" className="w-full text-xs">
            <UserRound className="size-3" /> Customer
          </TabsTrigger>
          <TabsTrigger value="role" className="w-full text-xs">
            <Crown className="size-3" /> Role
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customer">
          <SelectPopover
            label="Customer"
            placeholder="Select Customer..."
            data={customerData}
            selected={customers}
            onChange={setCustomers}
          />
        </TabsContent>

        <TabsContent value="role">
          <SelectPopover
            label="Role"
            placeholder="Select Customer Role..."
            data={DATA_ROLES}
            selected={roles}
            onChange={setRoles}
          />
        </TabsContent>
      </Tabs>

      {/* PRODUCT */}
      <SelectPopover
        label="Product"
        placeholder="Select Product..."
        data={productData}
        selected={products}
        onChange={setProducts}
        isProduct
      />

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
        className="text-xs h-8"
        onClick={handleDownload}
        disabled={disableDownload}
      >
        <DownloadCloud className="size-3.5" />
        Download
      </Button>
    </div>
  );
};
