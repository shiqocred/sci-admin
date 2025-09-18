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
import {
  Check,
  PlusCircle,
  Square,
  SquareCheckBig,
  XCircle,
} from "lucide-react";
import React, { MouseEvent, useEffect, useState } from "react";
import { OptionProps } from "../_api";

export const CustomerFilter = ({
  data,
  query,
  setQuery,
  disabled,
  current,
}: {
  data?: OptionProps;
  current: OptionProps;
  query: OptionProps & {
    role: string[];
    email: string;
    approve: boolean;
  };
  setQuery: any;
  disabled?: boolean;
}) => {
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isSpentsOpen, setIsSpentsOpen] = useState(false);

  const [orders, setOrders] = useState([0, 0]);
  const [spent, setSpent] = useState([0, 0]);

  const [minMax, setMinMax] = useState({
    minOrder: 0,
    maxOrder: 0,
    minSpent: 0,
    maxSpent: 0,
  });

  // Helper: check if any filter is active
  const hasFilterChanged = () => {
    const isDifferent = (queryVal: string | null, minMaxVal: number) =>
      !!queryVal && parseFloat(queryVal ?? "0") !== minMaxVal;

    return (
      query.approve ||
      !!query.email ||
      query.role.length ||
      isDifferent(query.minSpent, minMax.minSpent) ||
      isDifferent(query.maxSpent, minMax.maxSpent) ||
      isDifferent(query.minOrder, minMax.minOrder) ||
      isDifferent(query.maxOrder, minMax.maxOrder)
    );
  };

  // Helper: reset all filters
  const resetFilters = (e: MouseEvent) => {
    e.preventDefault();
    setQuery({
      approve: false,
      minSpent: "",
      maxSpent: "",
      minOrder: "",
      maxOrder: "",
      email: null,
      role: null,
    });
  };

  // Helper: wrapper for role/email onSelect
  const handleSelectEmail = (value: string | null) => {
    setQuery({
      email: value,
      minSpent: "",
      maxSpent: "",
      minOrder: "",
      maxOrder: "",
    });
  };

  const handleSelectRole = (value: string) => {
    setQuery({
      role: query.role.includes(value)
        ? query.role.filter((i) => i !== value)
        : [...query.role, value],
      minSpent: "",
      maxSpent: "",
      minOrder: "",
      maxOrder: "",
    });
  };

  const handleApplyOrder = (e: MouseEvent) => {
    e.preventDefault();
    setQuery({
      minOrder: orders[0],
      maxOrder: orders[1],
    });
    setIsOrdersOpen(false);
  };
  const handleApplySpent = (e: MouseEvent) => {
    e.preventDefault();
    setQuery({
      minSpent: spent[0],
      maxSpent: spent[1],
    });
    setIsSpentsOpen(false);
  };

  useEffect(() => {
    if (data && current) {
      const minValOrder = parseFloat(data.minOrder);
      const maxValOrder = parseFloat(data.maxOrder);

      const minValSpent = parseFloat(data.minSpent);
      const maxValSpent = parseFloat(data.maxSpent);

      setMinMax({
        minOrder: minValOrder,
        maxOrder: maxValOrder,
        minSpent: minValSpent,
        maxSpent: maxValSpent,
      });
    }
  }, [data, current]);

  return (
    <div className="flex items-center gap-2">
      <Popover open={isRoleOpen} onOpenChange={setIsRoleOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <div className="flex items-center border border-dashed rounded-md h-8 hover:bg-gray-100 transition cursor-default">
            <Button
              variant={"ghost"}
              className="text-xs font-medium h-full py-0 px-3 hover:bg-transparent"
            >
              <PlusCircle className="size-3" />
              Role
            </Button>
            {query.role && query.role.length > 0 && (
              <>
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-full"
                />
                {query.role.length <= 2 ? (
                  <div className="flex items-center gap-2 mx-2">
                    {query.role.map((item) => (
                      <div
                        key={item}
                        className={cn(
                          "text-xs font-medium rounded-sm px-2 py-0.5 flex items-center justify-center",
                          item === "basic" && "bg-emerald-200",
                          item === "petshop" && "bg-amber-200",
                          item === "veterinarian" && "bg-violet-200"
                        )}
                      >
                        {item === "basic" && "Pet Owner"}
                        {item === "petshop" && "Pet Shop"}
                        {item === "veterinarian" && "Vet Clinic"}
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
                    {query.role.length.toLocaleString()} Role
                    {pronoun(query.role.length)}
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
                <CommandItem
                  value="basic"
                  className="text-xs"
                  onSelect={(e) => handleSelectRole(e)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      query.role.includes("basic")
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="text-primary-foreground size-3" />
                  </div>
                  Pet Owner
                </CommandItem>
                <CommandItem
                  value="petshop"
                  className="text-xs"
                  onSelect={(e) => handleSelectRole(e)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      query.role.includes("petshop")
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="text-primary-foreground size-3" />
                  </div>
                  Pet Shop
                </CommandItem>
                <CommandItem
                  value="veterinarian"
                  className="text-xs"
                  onSelect={(e) => handleSelectRole(e)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      query.role.includes("veterinarian")
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="text-primary-foreground size-3" />
                  </div>
                  Vet Clinic
                </CommandItem>
              </CommandGroup>
              {query.role && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      className="text-xs font-medium justify-center"
                      onSelect={() => {
                        setQuery({ role: [] });
                        setIsRoleOpen(false);
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
              Email
            </Button>
            {query.email && (
              <>
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-full"
                />
                <div
                  className={cn(
                    "text-xs font-medium rounded-sm mx-2 px-2 py-0.5 capitalize flex items-center justify-center",
                    query.email === "verified" && "bg-emerald-200",
                    query.email === "not-verified" && "bg-rose-200"
                  )}
                >
                  {query.email.split("-").join(" ")}
                </div>
              </>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-32" align="start">
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  value="verified"
                  className="text-xs"
                  onSelect={(e) => handleSelectEmail(e)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      query.email === "verified"
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="text-primary-foreground size-3" />
                  </div>
                  Verified
                </CommandItem>
                <CommandItem
                  value="not-verified"
                  className="text-xs"
                  onSelect={(e) => handleSelectEmail(e)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      query.email === "not-verified"
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="text-primary-foreground size-3" />
                  </div>
                  Not Verify
                </CommandItem>
              </CommandGroup>
              {query.email && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      className="text-xs font-medium justify-center"
                      onSelect={() => {
                        handleSelectEmail("");
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
      <Popover
        open={isOrdersOpen}
        onOpenChange={(e) => {
          setIsOrdersOpen(!isOrdersOpen);
          if (e) {
            setOrders([
              parseFloat(current.minOrder),
              parseFloat(current.maxOrder),
            ]);
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
              Orders
            </Button>
            {((!!query.minOrder &&
              parseFloat(query.minOrder ?? "0") !== minMax.minOrder) ||
              (!!query.maxOrder &&
                parseFloat(query.maxOrder ?? "0") !== minMax.maxOrder)) && (
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
                  {query.minOrder === query.maxOrder
                    ? query.minOrder
                    : query.minOrder + " - " + query.maxOrder}
                </div>
              </>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-1 w-52" align="start">
          <div className="h-6 flex items-center justify-center px-2.5 pb-1">
            <Slider
              value={orders}
              classThumb="size-3 hover:ring-1"
              classTrack="data-[orientation=horizontal]:h-1"
              onValueChange={setOrders}
              max={minMax.maxOrder}
              min={minMax.minOrder}
            />
          </div>
          <div className="h-7 flex items-center divide-x border-t">
            <p className="h-full w-full text-xs flex items-center justify-center">
              Min: {orders[0]}
            </p>
            <p className="h-full w-full text-xs flex items-center justify-center">
              Max: {orders[1]}
            </p>
          </div>
          <div className="h-8 flex items-center divide-x border-t pt-1">
            <Button
              size={"sm"}
              className="text-xs h-7 w-full flex-auto rounded"
              onClick={handleApplyOrder}
            >
              Apply Filter
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Popover
        open={isSpentsOpen}
        onOpenChange={(e) => {
          setIsSpentsOpen(!isSpentsOpen);
          if (e) {
            setSpent([
              parseFloat(current.minSpent),
              parseFloat(current.maxSpent),
            ]);
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
              Spents
            </Button>
            {((!!query.minSpent &&
              parseFloat(query.minSpent ?? "0") !== minMax.minSpent) ||
              (!!query.maxSpent &&
                parseFloat(query.maxSpent ?? "0") !== minMax.maxSpent)) && (
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
                  {query.minSpent === query.maxSpent
                    ? formatRupiah(query.minSpent ?? "0")
                    : formatRupiah(query.minSpent ?? "0") +
                      " - " +
                      formatRupiah(query.maxSpent ?? "0")}
                </div>
              </>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-1 w-72" align="start">
          <div className="h-6 flex items-center justify-center px-2 pb-1">
            <Slider
              value={spent}
              classThumb="size-3 hover:ring-1"
              classTrack="data-[orientation=horizontal]:h-1"
              onValueChange={setSpent}
              min={minMax.minSpent}
              max={minMax.maxSpent}
              step={1000}
            />
          </div>
          <div className="h-7 flex items-center divide-x border-t">
            <p className="h-full w-full text-xs flex items-center justify-center">
              Min: {formatRupiah(spent[0])}
            </p>
            <p className="h-full w-full text-xs flex items-center justify-center">
              Max: {formatRupiah(spent[1])}
            </p>
          </div>
          <div className="h-8 flex items-center divide-x border-t pt-1">
            <Button
              size={"sm"}
              className="text-xs h-7 w-full flex-auto rounded"
              onClick={handleApplySpent}
            >
              Apply Filter
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        className="border border-dashed rounded-md h-8 hover:bg-gray-100 transition text-xs py-0 px-3"
        variant={"outline"}
        onClick={() =>
          setQuery({
            approve: !query.approve,
            minSpent: "",
            maxSpent: "",
            minOrder: "",
            maxOrder: "",
          })
        }
      >
        {query.approve ? (
          <SquareCheckBig className="size-3.5 stroke-[1.25]" />
        ) : (
          <Square className="size-3.5 stroke-[1.25]" />
        )}
        Approval Required
      </Button>
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
