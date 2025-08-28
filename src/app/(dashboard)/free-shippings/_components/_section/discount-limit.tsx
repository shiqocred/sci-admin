import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkedFormat, checkedToString, numericString } from "@/lib/utils";
import React from "react";
import { InputProps } from "../client";

interface DiscountLimitProps {
  limitUse: string;
  setDiscounts: (e: any) => void;
  input: InputProps;
  setInput: React.Dispatch<React.SetStateAction<InputProps>>;
  limitOnce: string;
}

export const DiscountLimit = ({
  limitUse,
  setDiscounts,
  input,
  setInput,
  limitOnce,
}: DiscountLimitProps) => {
  return (
    <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-4">
      <Label className="flex flex-col items-start gap-1.5">
        <p>Maximum discount uses</p>
      </Label>
      <div className="flex flex-col gap-3">
        <Label className="flex items-center gap-2">
          <Checkbox
            checked={checkedFormat(limitUse)}
            onCheckedChange={(e) =>
              setDiscounts({ limitUse: checkedToString(e) })
            }
          />
          <p>Limit number of times this discount can be used in total</p>
        </Label>
        {checkedFormat(limitUse) && (
          <div className="ml-6">
            <Input
              type="number"
              className="border-gray-300 focus-visible:border-gray-400 focus-visible:ring-0 w-fit"
              value={input.use}
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  use: isNaN(parseFloat(e.target.value))
                    ? "0"
                    : numericString(e.target.value),
                }))
              }
            />
          </div>
        )}
        <Label className="flex items-center gap-2">
          <Checkbox
            checked={checkedFormat(limitOnce)}
            onCheckedChange={(e) =>
              setDiscounts({ limitOnce: checkedToString(e) })
            }
          />
          <p>Limit to one use per customer</p>
        </Label>
      </div>
    </div>
  );
};
