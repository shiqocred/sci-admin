import React, { useState, useMemo, MouseEvent, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { TooltipText } from "@/providers/tooltip-provider";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck,
  Check,
  ChevronDown,
  Crown,
  Download,
  DownloadCloud,
  ListCheck,
  ListX,
  Loader,
  Loader2,
  UserRound,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn, pronoun } from "@/lib/utils";
import { endOfDay, format, startOfDay, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import { useDownloadExport, useGetExportFilters } from "../_api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const dataStatuses = [
  { label: "Waiting Payment", value: "waiting-payment" },
  { label: "Processed", value: "processed" },
  { label: "Shipping", value: "shipping" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Expired", value: "expired" },
];

const dataRole = [
  { label: "Pet Owner", value: "basic" },
  { label: "Pet Shop", value: "petshop" },
  { label: "Vet Clinic", value: "veterinarian" },
];

/* ---------------------- Reusable Select Popover ---------------------- */
const SelectPopover = ({
  label,
  placeholder,
  data,
  selected,
  onChange,
  isVocal = false,
  isProduct = false,
}: {
  label: string;
  placeholder: string;
  data: { label: string; value: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  isVocal?: boolean;
  isProduct?: boolean;
}) => {
  const handleToggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const handleSelectAll = () =>
    onChange(selected.length === data.length ? [] : data.map((i) => i.value));

  const labelProduct = (name: string) => {
    const spliter = name.split(" ");
    const sku = spliter[0];
    const label = name.replace(sku, "");
    return { sku, label };
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="shadow-none border-gray-300 hover:border-gray-500 group text-xs h-8 justify-between hover:bg-transparent w-[262px] font-normal"
          >
            {selected.length > 0 ? (
              <p>
                {selected.length === data.length
                  ? `(${selected.length}) All Selected`
                  : `${selected.length} ${label}${pronoun(selected.length, isVocal)} Selected`}
              </p>
            ) : (
              <p>{placeholder}</p>
            )}
            <ChevronDown className="group-data-[state=open]:rotate-180 transition-all size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[262px] p-0">
          <Command>
            <CommandList>
              <CommandGroup>
                {data.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    className="text-xs"
                    onSelect={() => handleToggle(item.value)}
                  >
                    {isProduct ? (
                      <p>
                        <strong>{labelProduct(item.label).sku}</strong>{" "}
                        {labelProduct(item.label).label}
                      </p>
                    ) : (
                      <p>{item.label}</p>
                    )}
                    <Check
                      className={cn(
                        "size-3.5 ml-auto hidden",
                        selected.includes(item.value) && "flex"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <CommandItem onSelect={handleSelectAll} className="text-xs">
                  {selected.length === data.length ? (
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

/* ---------------------- Main Component ---------------------- */
export const OrderExport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"customer" | "role">("customer");
  const [statuses, setStatuses] = useState(dataStatuses.map((i) => i.value));
  const [customers, setCustomers] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [isOpenDate, setIsOpenDate] = useState(false);
  const [rangeDate, setRangeDate] = useState<DateRange>();

  const { mutate: exportData, isPending: isExporting } = useDownloadExport();

  const { data, isPending } = useGetExportFilters();

  const dataFilter = useMemo(() => data?.data, [data]);

  const formatRange = useMemo(() => {
    if (!rangeDate?.from && !rangeDate?.to) return "All Period";
    const { from, to } = rangeDate;
    if (from && to)
      return from.getTime() === to.getTime()
        ? format(from, "P", { locale: id })
        : `${format(from, "P", { locale: id })} - ${format(to, "P", {
            locale: id,
          })}`;
    const date = from ?? to;
    return date ? format(date, "P", { locale: id }) : "All Period";
  }, [rangeDate]);

  const isAllRole = useMemo(() => roles.length === dataRole.length, [roles]);
  const isAllStatus = useMemo(
    () => statuses.length === dataStatuses.length,
    [statuses]
  );
  const isAllCustomer = useMemo(
    () => dataFilter?.customers?.length === customers.length,
    [dataFilter, customers]
  );
  const isAllProduct = useMemo(
    () => dataFilter?.products?.length === products.length,
    [dataFilter, products]
  );

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
      isSameDate:
        rangeDate?.from && rangeDate?.to && rangeDate.from === rangeDate.to,
      isAllRole,
      isAllStatus,
      isAllCustomer,
      isAllProduct,
      type,
    };

    exportData(
      { body },
      {
        onSuccess: async (res) => {
          const url = window.URL.createObjectURL(res.data);

          const link = document.createElement("a");
          link.href = url;
          link.download = `REPORT DETAILS - ${format(new Date(), "P_HH_mm", { locale: id })}.xlsx`;
          document.body.appendChild(link);
          link.click();
        },
      }
    );
  };

  useEffect(() => {
    if (data) {
      setCustomers(data.data.customers.map((i) => i.value));
      setProducts(data.data.products.map((i) => i.value));
    }
  }, [data]);

  return (
    <>
      <Dialog open={isExporting}>
        <DialogContent showCloseButton={false} className="gap-0 w-xs h-40">
          <DialogHeader className="p-0 gap-0">
            <DialogTitle />
            <DialogDescription />
          </DialogHeader>
          <div className="flex flex-col gap-3 justify-center items-center text-center -mt-6">
            <Loader className="animate-spin size-6" />
            <p className="text-sm animate-pulse">
              Please wait, downloading data...
            </p>
          </div>
        </DialogContent>
      </Dialog>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <TooltipText value="Export Data">
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-8 flex-none disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={isPending}
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
          <div className="flex flex-col gap-3">
            {/* STATUS */}
            <SelectPopover
              label="Status"
              placeholder="Select Status Order..."
              data={dataStatuses}
              selected={statuses}
              onChange={setStatuses}
              isVocal={true}
            />

            {/* CUSTOMER / ROLE */}
            <Tabs
              value={type}
              onValueChange={(val: any) => {
                setType(val);
                if (val === "role" && roles.length === 0)
                  setRoles(dataRole.map((i) => i.value));
              }}
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
                  data={dataFilter?.customers ?? []}
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
              data={dataFilter?.products ?? []}
              selected={products}
              onChange={setProducts}
              isProduct={true}
            />

            {/* PERIOD */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Period</Label>
              <Popover open={isOpenDate} onOpenChange={setIsOpenDate}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="shadow-none border-gray-300 hover:border-gray-500 group text-xs h-8 justify-between hover:bg-transparent w-[262px] font-normal"
                  >
                    <p>{formatRange}</p>
                    <ChevronDown className="group-data-[state=open]:rotate-180 transition-all size-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    numberOfMonths={2}
                    mode="range"
                    defaultMonth={subMonths(new Date(), 1)}
                    disabled={{ after: new Date() }}
                    selected={rangeDate}
                    onSelect={setRangeDate}
                  />
                  <div className="flex items-center gap-3 border-t p-3 justify-end">
                    <Button
                      className="text-xs h-8"
                      onClick={() => setRangeDate(undefined)}
                    >
                      <CalendarCheck className="size-3.5" />
                      Reset / All Period
                    </Button>
                    <Button
                      className="text-xs h-8"
                      onClick={() => setIsOpenDate(false)}
                    >
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
              disabled={
                statuses.length === 0 ||
                (type === "role" && roles.length === 0) ||
                (type === "customer" && customers.length === 0) ||
                products.length === 0
              }
            >
              <DownloadCloud className="size-3.5" />
              Download
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
