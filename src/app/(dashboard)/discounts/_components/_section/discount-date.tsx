import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { id } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { checkedFormat, checkedToString } from "@/lib/utils";
import { InputProps } from "../client";

interface DiscountDateProps {
  dateStart: Date | undefined;
  setDateStart: React.Dispatch<React.SetStateAction<Date | undefined>>;
  input: InputProps;
  setInput: React.Dispatch<React.SetStateAction<InputProps>>;
  endDate: string;
  setDiscounts: (e: any) => void;
  dateEnd: Date | undefined;
  setDateEnd: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

export const DiscountDate = ({
  dateStart,
  setDateStart,
  input,
  setInput,
  endDate,
  setDiscounts,
  dateEnd,
  setDateEnd,
}: DiscountDateProps) => {
  return (
    <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-4">
      <Label className="flex flex-col items-start gap-1.5">
        <p>Active dates</p>
      </Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker"
                className="w-full justify-between font-normal bg-transparent border-gray-300 hover:border-gray-400 hover:bg-gray-100 shadow-none data-[state=open]:border-gray-400 group"
              >
                {dateStart
                  ? format(dateStart, "PP", { locale: id })
                  : "Select date"}
                <ChevronDownIcon className="group-data-[state=open]:rotate-180 transition-all" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={dateStart}
                captionLayout="dropdown"
                disabled={{ before: new Date() }}
                onSelect={(date) => {
                  setDateStart(date);
                  setDateEnd(date);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Start Time</Label>
          <Input
            type="time"
            step="60"
            value={input.startTime}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, startTime: e.target.value }))
            }
            className="border-gray-300 focus-visible:border-gray-400 focus-visible:ring-0 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
        <Label className="flex items-center gap-2 col-span-2">
          <Checkbox
            checked={checkedFormat(endDate)}
            onCheckedChange={(e) =>
              setDiscounts({ endDate: checkedToString(e) })
            }
          />
          <p>Set end date</p>
        </Label>
        {checkedFormat(endDate) && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker"
                    className="w-full justify-between font-normal bg-transparent border-gray-300 hover:border-gray-400 hover:bg-gray-100 shadow-none data-[state=open]:border-gray-400 group"
                  >
                    {dateEnd
                      ? format(dateEnd, "PP", { locale: id })
                      : "Select date"}
                    <ChevronDownIcon className="group-data-[state=open]:rotate-180 transition-all" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={dateEnd}
                    captionLayout="dropdown"
                    disabled={{ before: dateStart ?? new Date() }}
                    onSelect={(date) => {
                      setDateEnd(date);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>End Time</Label>
              <Input
                type="time"
                step="60"
                value={input.endTime}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    endTime: e.target.value,
                  }))
                }
                className="border-gray-300 focus-visible:border-gray-400 focus-visible:ring-0 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
