import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatRupiah, numericString } from "@/lib/utils";
import { InputProps } from "../client";

interface DiscountMinimumProps {
  minimumReq: string;
  setDiscounts: (e: any) => void;
  input: InputProps;
  setInput: React.Dispatch<React.SetStateAction<InputProps>>;
}

export const DiscountMinimum = ({
  minimumReq,
  setDiscounts,
  input,
  setInput,
}: DiscountMinimumProps) => {
  return (
    <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-4">
      <Label className="flex flex-col items-start gap-1.5">
        <p>Minimum purchase requirements</p>
      </Label>
      <Select
        value={minimumReq}
        onValueChange={(e) => setDiscounts({ minimumReq: e })}
      >
        <SelectTrigger className="w-full data-[state=open]:border-gray-400 hover:border-gray-400 shadow-none border-gray-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="nothing">No minimum requirements</SelectItem>
          <SelectItem value="amount">Minimum purchase amount</SelectItem>
          <SelectItem value="quantity">Minimum quantity of items</SelectItem>
        </SelectContent>
      </Select>
      {minimumReq === "amount" && (
        <div className="flex items-center relative">
          <Input
            value={input.purchase}
            onChange={(e) =>
              setInput((prev) => ({
                ...prev,
                purchase: isNaN(parseFloat(e.target.value))
                  ? "0"
                  : numericString(e.target.value),
              }))
            }
            type="number"
            className="border-gray-300 focus-visible:border-gray-400 shadow-none focus-visible:ring-0"
          />
          <p className="absolute right-3 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
            {formatRupiah(input.purchase)}
          </p>
        </div>
      )}
      {minimumReq === "quantity" && (
        <Input
          value={input.quantity}
          onChange={(e) =>
            setInput((prev) => ({
              ...prev,
              quantity: isNaN(parseFloat(e.target.value))
                ? "0"
                : numericString(e.target.value),
            }))
          }
          type="number"
          className="border-gray-300 focus-visible:border-gray-400 shadow-none focus-visible:ring-0"
        />
      )}
    </div>
  );
};
