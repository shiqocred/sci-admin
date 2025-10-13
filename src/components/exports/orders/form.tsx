"use client";

import React, {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";
import { OrderExportProps } from "./_api";
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
import { subMonths } from "date-fns";

/* ---------------------- Types ---------------------- */
interface DataProps {
  label: string;
  value: string;
}

interface ExportFormProps {
  statuses: string[];
  setStatuses: Dispatch<SetStateAction<string[]>>;
  type: "customer" | "role";
  setType: Dispatch<SetStateAction<"customer" | "role">>;
  roles: string[];
  setRoles: Dispatch<SetStateAction<string[]>>;
  dataFilter?: OrderExportProps;
  customers: string[];
  setCustomers: Dispatch<SetStateAction<string[]>>;
  products: string[];
  setProducts: Dispatch<SetStateAction<string[]>>;
  isOpenDate: boolean;
  setIsOpenDate: Dispatch<SetStateAction<boolean>>;
  formatRange: string;
  rangeDate?: DateRange;
  setRangeDate: Dispatch<SetStateAction<DateRange | undefined>>;
  handleDownload: (e: MouseEvent) => void;
  isMarketing?: boolean;
  dataStatuses: DataProps[];
  dataRole: DataProps[];
}

/* ---------------------- Component ---------------------- */
export const ExportForm = ({
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
  dataStatuses,
  dataRole,
  isMarketing = false,
}: ExportFormProps) => {
  /* ---------------------- Memos & Callbacks ---------------------- */
  const disableDownload = useMemo(
    () =>
      statuses.length === 0 ||
      (type === "role" && roles.length === 0) ||
      (type === "customer" && customers.length === 0) ||
      products.length === 0,
    [statuses, type, roles, customers, products]
  );

  const handleTabChange = useCallback(
    (val: "customer" | "role") => {
      setType(val);
      if (val === "role" && roles.length === 0) {
        setRoles(dataRole.map((r) => r.value));
      }
    },
    [setType, setRoles, roles.length, dataRole]
  );

  const handleResetDate = useCallback(
    () => setRangeDate(undefined),
    [setRangeDate]
  );
  const handleCloseDate = useCallback(
    () => setIsOpenDate(false),
    [setIsOpenDate]
  );

  const customerData = dataFilter?.customers ?? [];
  const productData = dataFilter?.products ?? [];

  /* ---------------------- JSX ---------------------- */
  return (
    <div className="flex flex-col gap-3">
      {/* STATUS */}
      <SelectPopover
        label="Status"
        placeholder="Select Status Order..."
        data={dataStatuses}
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
            data={dataRole}
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
