import React, { MouseEvent, useState } from "react";
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
import { Check, PlusCircle, XCircle } from "lucide-react";
import { cn, pronoun } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrentProps, OptionProps } from "../_api";

type QueryProps = {
  userId?: string[];
  status?: string;
  minRating?: string;
  maxRating?: string;
};

export const ReviewsFilter = ({
  query,
  setQuery,
  data,
  current,
}: {
  query: QueryProps;
  setQuery: ({ userId, status, minRating, maxRating }: QueryProps) => void;
  data?: OptionProps;
  current?: CurrentProps;
}) => {
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const [rating, setRating] = useState([1, 5]);

  const handleSelectCustomer = (v: string) => {
    setQuery({
      userId: query.userId?.find((i) => i === v)
        ? query.userId.filter((i) => i !== v)
        : [...(query.userId ?? []), v],
    });
  };
  const handleSelectStatus = (v: string) => {
    setQuery({
      status: query.status === v ? "" : v,
    });
    setIsStatusOpen(false);
  };

  const handleRatingFilter = (e: MouseEvent) => {
    e.preventDefault();
    setQuery({
      minRating: rating[0].toString(),
      maxRating: rating[1].toString(),
    });
    setIsRatingOpen(false);
  };
  const hasFilterChanged = () => {
    const isDifferent = (queryVal: string | undefined, minMaxVal: number) =>
      !!queryVal && parseFloat(queryVal ?? "0") !== minMaxVal;

    return (
      (query.userId && query.userId.length > 0) ||
      !!query.status ||
      isDifferent(query.minRating, 1) ||
      isDifferent(query.maxRating, 5)
    );
  };

  // Helper: reset all filters
  const resetFilters = () => {
    setQuery({
      userId: [],
      status: "",
      minRating: "",
      maxRating: "",
    });
  };
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover open={isCustomerOpen} onOpenChange={setIsCustomerOpen}>
        <PopoverTrigger
          asChild
          // disabled={disabled}
        >
          <div className="flex items-center border border-dashed rounded-md h-8 hover:bg-gray-100 transition cursor-default">
            <Button
              variant={"ghost"}
              className="text-xs font-medium h-full py-0 px-3 hover:bg-transparent"
            >
              <PlusCircle className="size-3" />
              Customer
            </Button>
            {query.userId && query.userId.length > 0 && (
              <>
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-full"
                />
                {query.userId.length <= 2 ? (
                  <div className="flex items-center gap-2 mx-2">
                    {query.userId.map((item) => (
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
                    {query.userId.length.toLocaleString()} Customer
                    {pronoun(query.userId.length)}
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
                    onSelect={(e) => handleSelectCustomer(e)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        query.userId?.includes(customer.id)
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
              {query.userId && query.userId.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      className="text-xs font-medium justify-center"
                      onSelect={() => {
                        setQuery({ userId: [] });
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
        <PopoverTrigger
          asChild
          // disabled={disabled}
        >
          <div className="flex items-center border border-dashed rounded-md h-8 hover:bg-gray-100 transition cursor-default">
            <Button
              variant={"ghost"}
              className="text-xs font-medium h-full py-0 px-3 hover:bg-transparent"
            >
              <PlusCircle className="size-3" />
              Status
            </Button>
            {query.status && (
              <>
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-full"
                />
                <div
                  className={cn(
                    "text-xs font-medium rounded-sm mx-2 px-2 py-0.5 capitalize flex items-center justify-center",
                    query.status === "publish" && "bg-emerald-200",
                    query.status === "unpublish" && "bg-rose-200"
                  )}
                >
                  {query.status.split("-").join(" ")}
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
                  value="publish"
                  className="text-xs"
                  onSelect={(e) => handleSelectStatus(e)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      query.status === "publish"
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="text-primary-foreground size-3" />
                  </div>
                  Publish
                </CommandItem>
                <CommandItem
                  value="unpublish"
                  className="text-xs"
                  onSelect={(e) => handleSelectStatus(e)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      query.status === "unpublish"
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="text-primary-foreground size-3" />
                  </div>
                  Unpublish
                </CommandItem>
              </CommandGroup>
              {query.status && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      className="text-xs font-medium justify-center"
                      onSelect={() => {
                        handleSelectStatus("");
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
          open={isRatingOpen}
          onOpenChange={(e) => {
            setIsRatingOpen(!isRatingOpen);
            if (e) {
              setRating([current.minRating, current.maxRating]);
            }
          }}
        >
          <PopoverTrigger
            asChild
            // disabled={disabled}
          >
            <div className="flex items-center border border-dashed rounded-md h-8 hover:bg-gray-100 transition cursor-default">
              <Button
                variant={"ghost"}
                className="text-xs font-medium h-full py-0 px-2 hover:bg-transparent"
              >
                <PlusCircle className="size-3" />
                Rating
              </Button>
              {((!!query.minRating &&
                parseFloat(query.minRating ?? "0") !== 1) ||
                (!!query.maxRating &&
                  parseFloat(query.maxRating ?? "0") !== 5)) && (
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
                    {query.minRating === query.maxRating
                      ? query.minRating
                      : query.minRating + " - " + query.maxRating}
                  </div>
                </>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-1 w-52" align="start">
            <div className="h-6 flex items-center justify-center px-2.5 pb-1">
              <Slider
                value={rating}
                classThumb="size-3 hover:ring-1"
                classTrack="data-[orientation=horizontal]:h-1"
                onValueChange={setRating}
                max={5}
                min={1}
              />
            </div>
            <div className="h-7 flex items-center divide-x border-t">
              <p className="h-full w-full text-xs flex items-center justify-center">
                Min: {rating[0]}
              </p>
              <p className="h-full w-full text-xs flex items-center justify-center">
                Max: {rating[1]}
              </p>
            </div>
            <div className="h-8 flex items-center divide-x border-t pt-1">
              <Button
                size={"sm"}
                className="text-xs h-7 w-full flex-auto rounded"
                onClick={handleRatingFilter}
              >
                Apply Filter
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Skeleton className="h-8 w-[92px]" />
      )}
      {hasFilterChanged() && (
        <Button
          className="text-xs font-normal h-8 py-0 px-3"
          variant={"ghost"}
          // disabled={disabled}
          onClick={resetFilters}
        >
          Reset
          <XCircle />
        </Button>
      )}
    </div>
  );
};
