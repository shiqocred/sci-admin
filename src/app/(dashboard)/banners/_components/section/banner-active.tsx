import React, { Dispatch, SetStateAction } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BannerActiveProps {
  input: any;
  setInput: Dispatch<SetStateAction<any>>;
}

export const BannerActive = ({ input, setInput }: BannerActiveProps) => {
  const handleDateChange = (
    key: "startDate" | "endDate",
    date: Date | undefined
  ) => {
    setInput((prev: any) => ({
      ...prev,
      [key]: prev.isEnd || key === "startDate" ? date : undefined,
      ...(key === "startDate" && !prev.isEnd ? { endDate: undefined } : {}),
    }));
  };

  const handleTimeChange = (key: "startTime" | "endTime", value: string) => {
    setInput((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-5">
      <Label className="required">Active dates</Label>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="group w-full justify-between border-gray-300 bg-transparent font-normal shadow-none hover:border-gray-400 hover:bg-gray-100 data-[state=open]:border-gray-400"
              >
                {input.startDate
                  ? format(input.startDate, "PP", { locale: id })
                  : "Select date"}
                <ChevronDownIcon className="transition-all group-data-[state=open]:rotate-180" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={input.startDate}
                captionLayout="dropdown"
                disabled={{ before: new Date() }}
                onSelect={(date) => handleDateChange("startDate", date)}
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
            onChange={(e) => handleTimeChange("startTime", e.target.value)}
            className="appearance-none border-gray-300 focus-visible:border-gray-400 focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>

        <Label className="col-span-3 flex items-center gap-2">
          <Checkbox
            checked={input.isEnd}
            onCheckedChange={(checked) =>
              setInput((prev: any) => ({ ...prev, isEnd: checked }))
            }
          />
          <p>Set end date</p>
        </Label>

        {input.isEnd && (
          <>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="group w-full justify-between border-gray-300 bg-transparent font-normal shadow-none hover:border-gray-400 hover:bg-gray-100 data-[state=open]:border-gray-400"
                  >
                    {input.endDate
                      ? format(input.endDate, "PP", { locale: id })
                      : "Select date"}
                    <ChevronDownIcon className="transition-all group-data-[state=open]:rotate-180" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={input.endDate}
                    captionLayout="dropdown"
                    disabled={{ before: input.startDate ?? new Date() }}
                    onSelect={(date) => handleDateChange("endDate", date)}
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
                onChange={(e) => handleTimeChange("endTime", e.target.value)}
                className="appearance-none border-gray-300 focus-visible:border-gray-400 focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
