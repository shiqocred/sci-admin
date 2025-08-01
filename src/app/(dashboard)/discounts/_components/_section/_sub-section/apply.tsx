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
import { InputProps } from "../../client";

interface ApplyProps {
  apply: string;
  setDiscounts: (e: any) => void;
  setInput: React.Dispatch<React.SetStateAction<InputProps>>;
}

export const Apply = ({ apply, setInput, setDiscounts }: ApplyProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>Applies to</Label>
      <Select
        value={apply}
        onValueChange={(e) => {
          setDiscounts({ apply: e });
          setInput((prev) => ({ ...prev, selected: [] }));
        }}
      >
        <SelectTrigger className="w-full data-[state=open]:border-gray-400 hover:border-gray-400 shadow-none border-gray-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="categories">Spesific Categories</SelectItem>
            <SelectItem value="suppliers">Spesific Suppliers</SelectItem>
            <SelectItem value="pets">Spesific Pets</SelectItem>
            <SelectItem value="products">Spesific Product</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
