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

export const BannerActive = ({
  input,
  setInput,
}: {
  input: any;
  setInput: Dispatch<SetStateAction<any>>;
}) => {
  return (
    <div className="bg-gray-50 border-gray-200 border p-5 rounded-lg flex flex-col gap-4">
      <Label className="flex flex-col items-start gap-1.5">
        <p>Active dates</p>
      </Label>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col col-span-2 gap-1.5">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker"
                className="w-full justify-between font-normal bg-transparent border-gray-300 hover:border-gray-400 hover:bg-gray-100 shadow-none data-[state=open]:border-gray-400 group"
              >
                {input.startDate
                  ? format(input.startDate, "PP", { locale: id })
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
                selected={input.startDate}
                captionLayout="dropdown"
                disabled={{ before: new Date() }}
                onSelect={(date) => {
                  setInput((prev: any) => ({
                    ...prev,
                    startDate: date,
                    endDate: prev.isEnd ? date : undefined,
                  }));
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
              setInput((prev: any) => ({
                ...prev,
                startTime: e.target.value,
              }))
            }
            className="border-gray-300 focus-visible:border-gray-400 focus-visible:ring-0 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
        <Label className="flex items-center gap-2 col-span-3">
          <Checkbox
            checked={input.isEnd}
            onCheckedChange={(e) =>
              setInput((prev: any) => ({ ...prev, isEnd: e }))
            }
          />
          <p>Set end date</p>
        </Label>
        {input.isEnd && (
          <>
            <div className="flex flex-col col-span-2 gap-1.5">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker"
                    className="w-full justify-between font-normal bg-transparent border-gray-300 hover:border-gray-400 hover:bg-gray-100 shadow-none data-[state=open]:border-gray-400 group"
                  >
                    {input.endDate
                      ? format(input.endDate, "PP", { locale: id })
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
                    selected={input.endDate}
                    captionLayout="dropdown"
                    disabled={{ before: input.startDate ?? new Date() }}
                    onSelect={(date) => {
                      setInput((prev: any) => ({
                        ...prev,
                        endDate: prev.isEnd ? date : undefined,
                      }));
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
                  setInput((prev: any) => ({
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
