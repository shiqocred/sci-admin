import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Percent } from "lucide-react";
import { formatRupiah, numericString } from "@/lib/utils";
import { InputProps } from "../../client";

interface ValueProps {
  value: string;
  setDiscounts: (e: any) => void;
  input: InputProps;
  setInput: React.Dispatch<React.SetStateAction<InputProps>>;
}

export const Value = ({ value, setDiscounts, input, setInput }: ValueProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>Discount Value</Label>
      <div className="grid grid-cols-3 gap-4">
        <Select value={value} onValueChange={(e) => setDiscounts({ value: e })}>
          <SelectTrigger className="w-full col-span-2 data-[state=open]:border-gray-400 hover:border-gray-400 border-gray-300 shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed amount</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {value === "percentage" ? (
          <div className="flex items-center relative">
            <Input
              className="focus-visible:ring-0 shadow-none border-gray-300 focus-visible:border-gray-500"
              value={input.percentage}
              type="number"
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  percentage: isNaN(parseFloat(e.target.value))
                    ? "0"
                    : numericString(e.target.value),
                }))
              }
            />
            <Percent className="absolute right-3 size-4 text-gray-700" />
          </div>
        ) : (
          <div className="flex items-center relative">
            <Input
              className="focus-visible:ring-0 shadow-none border-gray-300 focus-visible:border-gray-500"
              value={input.fixed}
              type="number"
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  fixed: isNaN(parseFloat(e.target.value))
                    ? "0"
                    : numericString(e.target.value),
                }))
              }
            />
            <p className="absolute right-3 text-[11px] bg-gray-200 px-2 py-0.5 rounded">
              {formatRupiah(input.fixed)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
