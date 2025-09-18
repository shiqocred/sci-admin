import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { cn, formatRupiah, pronoun } from "@/lib/utils";
import { Check, PlusCircle, XCircle } from "lucide-react";
import React, { MouseEvent, useEffect, useState } from "react";
import { CurrentProps, OptionProps } from "../_api";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";

export const OrderFilter = ({
  data,
  query,
  setQuery,
  disabled,
  current,
}: {
  data?: OptionProps;
  current?: CurrentProps;
  query: {
    customer: string[];
    status: string[];
    minPrice: string;
    maxPrice: string;
    minProduct: string;
    maxProduct: string;
    minDate: string;
    maxDate: string;
  };
  setQuery: any;
  disabled?: boolean;
}) => {
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const [price, setPrice] = useState([0, 0]);
  const [product, setProduct] = useState([0, 0]);
  const [rangeDate, setRangeDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [minMax, setMinMax] = useState({
    minPrice: 0,
    maxPrice: 0,
    minProduct: 0,
    maxProduct: 0,
    minDate: rangeDate?.from,
    maxDate: rangeDate?.to,
  });

  // Helper: check if any filter is active
  const hasFilterChanged = () => {
    const isDifferent = (queryVal: string | null, minMaxVal: number) =>
      !!queryVal && parseFloat(queryVal ?? "0") !== minMaxVal;

    return (
      (query.customer && query.customer.length > 0) ||
      (query.status && query.status.length > 0) ||
      isDifferent(query.minPrice, minMax.minPrice) ||
      isDifferent(query.maxPrice, minMax.maxPrice) ||
      isDifferent(query.minProduct, minMax.minProduct) ||
      isDifferent(query.maxProduct, minMax.maxProduct) ||
      (!!query.minDate &&
        query.minDate !==
          (minMax.minDate ? format(minMax.minDate, "yyyy-MM-dd") : "")) ||
      (!!query.maxDate &&
        query.maxDate !==
          (minMax.maxDate ? format(minMax.maxDate, "yyyy-MM-dd") : ""))
    );
  };

  // Helper: reset all filters
  const resetFilters = () => {
    setQuery({
      customer: [],
      status: [],
      minPrice: "",
      maxPrice: "",
      minProduct: "",
      maxProduct: "",
      minDate: "",
      maxDate: "",
    });
  };

  // Helper: wrapper for role/email onSelect
  const handleSelect = (field: "customer" | "status", value: string) => {
    const currentField = query[field];
    setQuery({
      [field]:
        currentField && currentField.includes(value)
          ? currentField.filter((i) => i !== value)
          : [...(currentField ?? []), value],
    });
  };

  const handleProductFilter = (e: MouseEvent) => {
    e.preventDefault();
    setQuery({
      minProduct: product[0],
      maxProduct: product[1],
    });
    setIsProductOpen(false);
  };

  const handlePriceFilter = (e: MouseEvent) => {
    e.preventDefault();
    setQuery({
      minPrice: price[0],
      maxPrice: price[1],
    });
    setIsPriceOpen(false);
  };

  const handleDateFilter = (e: MouseEvent) => {
    e.preventDefault();
    setQuery({
      minDate: format(rangeDate?.from as Date, "yyyy-MM-dd"),
      maxDate: format(rangeDate?.to as Date, "yyyy-MM-dd"),
    });
    setIsDateOpen(false);
  };

  useEffect(() => {
    if (data) {
      const minValPrice = data.minPrice;
      const maxValPrice = data.maxPrice;

      const minValProduct = data.minProduct;
      const maxValProduct = data.maxProduct;

      const minValDate = data.minDate;
      const maxValDate = data.maxDate;

      setMinMax({
        minPrice: minValPrice,
        maxPrice: maxValPrice,
        minProduct: minValProduct,
        maxProduct: maxValProduct,
        minDate: minValDate,
        maxDate: maxValDate,
      });
    }
  }, [data]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover open={isCustomerOpen} onOpenChange={setIsCustomerOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <div className="flex items-center border border-dashed rounded-md h-8 hover:bg-gray-100 transition cursor-default">
            <Button
              variant={"ghost"}
              className="text-xs font-medium h-full py-0 px-3 hover:bg-transparent"
            >
              <PlusCircle className="size-3" />
              Customer
            </Button>
            {query.customer && query.customer.length > 0 && (
              <>
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-full"
                />
                {query.customer.length <= 2 ? (
                  <div className="flex items-center gap-2 mx-2">
                    {query.customer.map((item) => (
                      <div
                        key={item}
                        className={cn(
                          "text-xs font-medium rounded-sm px-2 py-0.5 flex items-center justify-center",
                          "bg-gray-200"
                        )}
                      >
                        {data?.customers.find((i) => i.id === item)?.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={cn(
                      "text-xs font-medium rounded-sm mx-2 px-2 py-0.5 flex items-center justify-center",
                      "bg-gray-200"
                    )}
                  >
                    {query.customer.length.toLocaleString()} Customer
                    {pronoun(query.customer.length)}
                  </div>
                )}
              </>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-32" align="start">
          <Command>
            <CommandList>
              <CommandGroup>
                {data?.customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.id}
                    className="text-xs"
                    onSelect={(e) => handleSelect("customer", e)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        query.customer?.includes(customer.id)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="text-primary-foreground size-3" />
                    </div>
                    {customer.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              {query.customer && query.customer.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      className="text-xs font-medium justify-center"
                      onSelect={() => {
                        setQuery({ customer: [] });
                        setIsCustomerOpen(false);
                      }}
                    >
                      Clear filters
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <div className="flex items-center border border-dashed rounded-md h-8 hover:bg-gray-100 transition cursor-default">
            <Button
              variant={"ghost"}
              className="text-xs font-medium h-full py-0 px-3 hover:bg-transparent"
            >
              <PlusCircle className="size-3" />
              Status
            </Button>
            {query.status && query.status.length > 0 && (
              <>
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-full"
                />
                {query.status.length <= 2 ? (
                  <div className="flex items-center gap-2 mx-2">
                    {query.status.map((item) => (
                      <div
                        key={item}
                        className={cn(
                          "text-xs font-medium rounded-sm px-2 py-0.5 capitalize flex items-center justify-center",
                          item === "waiting-payment" && "bg-yellow-200",
                          item === "processed" && "bg-blue-200",
                          item === "shipping" && "bg-yellow-200",
                          item === "delivered" && "bg-green-200",
                          item === "cancelled" && "bg-red-200",
                          item === "expired" && "bg-orange-200"
                        )}
                      >
                        {item.split("-").join(" ")}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={cn(
                      "text-xs font-medium rounded-sm mx-2 px-2 py-0.5 flex items-center justify-center",
                      "bg-gray-200"
                    )}
                  >
                    {query.status.length.toLocaleString()} Status
                    {pronoun(query.status.length, true)}
                  </div>
                )}
              </>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-40" align="start">
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  value="waiting-payment"
                  className="text-xs"
                  onSelect={(e) => handleSelect("status", e)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      query.status?.includes("waiting-payment")
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="text-primary-foreground size-3" />
                  </div>
                  Waiting Payment
                </CommandItem>
                <CommandItem
                  value="processed"
                  className="text-xs"
                  onSelect={(e) => handleSelect("status", e)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      query.status?.includes("processed")
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="text-primary-foreground size-3" />
                  </div>
                  Processed
                </CommandItem>
                <CommandItem
                  value="shipping"
                  className="text-xs"
                  onSelect={(e) => handleSelect("status", e)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      query.status?.includes("shipping")
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="text-primary-foreground size-3" />
                  </div>
                  Shipping
                </CommandItem>
                <CommandItem
                  value="delivered"
                  className="text-xs"
                  onSelect={(e) => handleSelect("status", e)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      query.status?.includes("delivered")
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="text-primary-foreground size-3" />
                  </div>
                  Delivered
                </CommandItem>
                <CommandItem
                  value="cancelled"
                  className="text-xs"
                  onSelect={(e) => handleSelect("status", e)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      query.status?.includes("cancelled")
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="text-primary-foreground size-3" />
                  </div>
                  Cancelled
                </CommandItem>
                <CommandItem
                  value="expired"
                  className="text-xs"
                  onSelect={(e) => handleSelect("status", e)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      query.status?.includes("expired")
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="text-primary-foreground size-3" />
                  </div>
                  Expired
                </CommandItem>
              </CommandGroup>
              {query.status && query.status.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      className="text-xs font-medium justify-center"
                      onSelect={() => {
                        setQuery({ status: [] });
                        setIsStatusOpen(false);
                      }}
                    >
                      Clear filters
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {current ? (
        <Popover
          open={isProductOpen}
          onOpenChange={(e) => {
            setIsProductOpen(!isProductOpen);
            if (e) {
              setProduct([current.minProduct, current.maxProduct]);
            }
          }}
        >
          <PopoverTrigger asChild disabled={disabled}>
            <div className="flex items-center border border-dashed rounded-md h-8 hover:bg-gray-100 transition cursor-default">
              <Button
                variant={"ghost"}
                className="text-xs font-medium h-full py-0 px-2 hover:bg-transparent"
              >
                <PlusCircle className="size-3" />
                Product
              </Button>
              {((!!query.minProduct &&
                parseFloat(query.minProduct ?? "0") !== minMax.minProduct) ||
                (!!query.maxProduct &&
                  parseFloat(query.maxProduct ?? "0") !==
                    minMax.maxProduct)) && (
                <>
                  <Separator
                    orientation="vertical"
                    className="data-[orientation=vertical]:h-full"
                  />
                  <div
                    className={cn(
                      "text-xs font-medium rounded-sm mx-2 px-2 py-0.5 capitalize flex items-center justify-center",
                      "bg-gray-200"
                    )}
                  >
                    {query.minProduct === query.maxProduct
                      ? query.minProduct
                      : query.minProduct + " - " + query.maxProduct}
                  </div>
                </>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-1 w-52" align="start">
            <div className="h-6 flex items-center justify-center px-2.5 pb-1">
              <Slider
                value={product}
                classThumb="size-3 hover:ring-1"
                classTrack="data-[orientation=horizontal]:h-1"
                onValueChange={setProduct}
                max={minMax.maxProduct}
                min={minMax.minProduct}
              />
            </div>
            <div className="h-7 flex items-center divide-x border-t">
              <p className="h-full w-full text-xs flex items-center justify-center">
                Min: {product[0]}
              </p>
              <p className="h-full w-full text-xs flex items-center justify-center">
                Max: {product[1]}
              </p>
            </div>
            <div className="h-8 flex items-center divide-x border-t pt-1">
              <Button
                size={"sm"}
                className="text-xs h-7 w-full flex-auto rounded"
                onClick={handleProductFilter}
              >
                Apply Filter
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Skeleton className="h-8 w-[92px]" />
      )}
      {current ? (
        <Popover
          open={isPriceOpen}
          onOpenChange={(e) => {
            setIsPriceOpen(!isPriceOpen);
            if (e) {
              setPrice([current.minPrice, current.maxPrice]);
            }
          }}
        >
          <PopoverTrigger asChild disabled={disabled}>
            <div className="flex items-center border border-dashed rounded-md h-8 hover:bg-gray-100 transition cursor-default">
              <Button
                variant={"ghost"}
                className="text-xs font-medium h-full py-0 px-3 hover:bg-transparent"
              >
                <PlusCircle className="size-3" />
                Price
              </Button>
              {((!!query.minPrice &&
                parseFloat(query.minPrice ?? "0") !== minMax.minPrice) ||
                (!!query.maxPrice &&
                  parseFloat(query.maxPrice ?? "0") !== minMax.maxPrice)) && (
                <>
                  <Separator
                    orientation="vertical"
                    className="data-[orientation=vertical]:h-full"
                  />
                  <div
                    className={cn(
                      "text-xs font-medium rounded-sm mx-2 px-2 py-0.5 capitalize flex items-center justify-center",
                      "bg-gray-200"
                    )}
                  >
                    {query.minPrice === query.maxPrice
                      ? formatRupiah(query.minPrice ?? "0")
                      : formatRupiah(query.minPrice ?? "0") +
                        " - " +
                        formatRupiah(query.maxPrice ?? "0")}
                  </div>
                </>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-1 w-72" align="start">
            <div className="h-6 flex items-center justify-center px-2 pb-1">
              <Slider
                value={price}
                classThumb="size-3 hover:ring-1"
                classTrack="data-[orientation=horizontal]:h-1"
                onValueChange={setPrice}
                min={minMax.minPrice}
                max={minMax.maxPrice}
                step={1000}
              />
            </div>
            <div className="h-7 flex items-center divide-x border-t">
              <p className="h-full w-full text-xs flex items-center justify-center">
                Min: {formatRupiah(price[0])}
              </p>
              <p className="h-full w-full text-xs flex items-center justify-center">
                Max: {formatRupiah(price[1])}
              </p>
            </div>
            <div className="h-8 flex items-center divide-x border-t pt-1">
              <Button
                size={"sm"}
                className="text-xs h-7 w-full flex-auto rounded"
                onClick={handlePriceFilter}
              >
                Apply Filter
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Skeleton className="h-8 w-[75px]" />
      )}
      {current && minMax.minDate && minMax.maxDate ? (
        <Popover
          open={isDateOpen}
          onOpenChange={(e) => {
            setIsDateOpen(!isDateOpen);
            if (e) {
              setRangeDate({ from: current.minDate, to: current.maxDate });
            }
          }}
        >
          <PopoverTrigger asChild disabled={disabled}>
            <div className="flex items-center border border-dashed rounded-md h-8 hover:bg-gray-100 transition cursor-default">
              <Button
                variant={"ghost"}
                className="text-xs font-medium h-full py-0 px-3 hover:bg-transparent"
              >
                <PlusCircle className="size-3" />
                Date
              </Button>
              {((!!query.minDate &&
                query.minDate !==
                  format(minMax.minDate as Date, "yyyy-MM-dd")) ||
                (!!query.maxDate &&
                  query.maxDate !==
                    format(minMax.maxDate as Date, "yyyy-MM-dd"))) && (
                <>
                  <Separator
                    orientation="vertical"
                    className="data-[orientation=vertical]:h-full"
                  />

                  {query.minDate === query.maxDate ? (
                    <div
                      className={cn(
                        "text-xs font-medium rounded-sm mx-2 px-2 py-0.5 capitalize flex items-center justify-center",
                        "bg-gray-200"
                      )}
                    >
                      {format(query.minDate, "P")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mx-2">
                      <div
                        className={cn(
                          "text-xs font-medium rounded-sm px-2 py-0.5 capitalize flex items-center justify-center",
                          "bg-gray-200"
                        )}
                      >
                        {format(query.minDate, "P")}
                      </div>
                      -
                      <div
                        className={cn(
                          "text-xs font-medium rounded-sm px-2 py-0.5 capitalize flex items-center justify-center",
                          "bg-gray-200"
                        )}
                      >
                        {format(query.maxDate, "P")}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto" align="center">
            <Calendar
              mode="range"
              numberOfMonths={2}
              defaultMonth={minMax?.minDate}
              disabled={{
                before: minMax.minDate as Date,
                after: minMax.maxDate as Date,
              }}
              selected={rangeDate}
              onSelect={setRangeDate}
            />
            <div className="h-10 flex items-center divide-x border-t p-1">
              <Button
                size={"sm"}
                className="text-xs h-7 ml-auto rounded"
                onClick={handleDateFilter}
              >
                Apply Filter
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Skeleton className="h-8 w-[73px]" />
      )}
      {hasFilterChanged() && (
        <Button
          className="text-xs font-normal h-8 py-0 px-3"
          variant={"ghost"}
          disabled={disabled}
          onClick={resetFilters}
        >
          Reset
          <XCircle />
        </Button>
      )}
    </div>
  );
};
