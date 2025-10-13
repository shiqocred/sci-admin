"use client";

import React, { useState, useMemo, useEffect, MouseEvent } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TooltipText } from "@/providers/tooltip-provider";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { endOfDay, format, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { useDownloadExport, useGetExportFilters } from "./_api";
import { ExportForm } from "./form";
import { ExportingDialog } from "../exporting-dialog";

/* ---------------------- Static Data ---------------------- */
const DATA_STATUSES = [
  { label: "Waiting Payment", value: "waiting-payment" },
  { label: "Processed", value: "processed" },
  { label: "Shipping", value: "shipping" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Expired", value: "expired" },
];

const DATA_ROLES = [
  { label: "Pet Owner", value: "basic" },
  { label: "Pet Shop", value: "petshop" },
  { label: "Vet Clinic", value: "veterinarian" },
];

/* ---------------------- Utility ---------------------- */
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

/* ---------------------- Main Component ---------------------- */
export const OrderExport = ({
  isMarketing = false,
}: {
  isMarketing?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"customer" | "role">("customer");
  const [statuses, setStatuses] = useState<string[]>(() =>
    DATA_STATUSES.map((i) => i.value)
  );
  const [roles, setRoles] = useState<string[]>([]);
  const [customers, setCustomers] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [isOpenDate, setIsOpenDate] = useState(false);
  const [rangeDate, setRangeDate] = useState<DateRange>();

  const { mutate: exportData, isPending: isExporting } = useDownloadExport();
  const { data, isPending } = useGetExportFilters();

  const dataFilter = data?.data;
  const formatRange = useMemo(() => formatDateRange(rangeDate), [rangeDate]);

  const getIsAll = (arr: string[], compare?: string[]) =>
    compare ? arr.length === compare.length : false;

  const isAllRole =
    type === "customer" ||
    getIsAll(
      roles,
      DATA_ROLES.map((i) => i.value)
    );
  const isAllStatus = getIsAll(
    statuses,
    DATA_STATUSES.map((i) => i.value)
  );
  const isAllCustomer =
    type === "role" ||
    getIsAll(
      customers,
      dataFilter?.customers?.map((i) => i.value)
    );
  const isAllProduct = getIsAll(
    products,
    dataFilter?.products?.map((i) => i.value)
  );
  console.log(isAllRole);

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
      }
    );
  };

  /* ---------------------- Initial Data Load ---------------------- */
  useEffect(() => {
    if (!dataFilter) return;
    setCustomers(dataFilter.customers.map((i) => i.value));
    setProducts(dataFilter.products.map((i) => i.value));
  }, [dataFilter]);

  /* ---------------------- Marketing Mode ---------------------- */
  if (isMarketing) {
    return (
      <div className="border rounded-lg w-full flex flex-col overflow-hidden p-3 gap-5">
        {isExporting && <ExportingDialog />}
        <div className="size-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-5 rounded-md">
          <h3 className="font-bold text-lg">Order Report</h3>
        </div>

        <ExportForm
          {...{
            statuses,
            setStatuses,
            type,
            setType,
            roles,
            setRoles,
            dataFilter,
            customers,
            setCustomers,
            products,
            setProducts,
            isOpenDate,
            setIsOpenDate,
            formatRange,
            rangeDate,
            setRangeDate,
            handleDownload,
          }}
          isMarketing
          dataStatuses={DATA_STATUSES}
          dataRole={DATA_ROLES}
        />
      </div>
    );
  }

  /* ---------------------- Default (Popover) Mode ---------------------- */
  return (
    <>
      {/* Dialog Loading */}
      {isExporting && <ExportingDialog />}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <TooltipText value="Export Data">
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={isPending}
              className="size-8 flex-none disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" />
              )}
            </Button>
          </PopoverTrigger>
        </TooltipText>

        <PopoverContent align="end" sideOffset={10} className="p-3">
          <ExportForm
            {...{
              statuses,
              setStatuses,
              type,
              setType,
              roles,
              setRoles,
              dataFilter,
              customers,
              setCustomers,
              products,
              setProducts,
              isOpenDate,
              setIsOpenDate,
              formatRange,
              rangeDate,
              setRangeDate,
              handleDownload,
            }}
            dataStatuses={DATA_STATUSES}
            dataRole={DATA_ROLES}
          />
        </PopoverContent>
      </Popover>
    </>
  );
};
