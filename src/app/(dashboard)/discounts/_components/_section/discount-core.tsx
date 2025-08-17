import React, { MouseEvent } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateRandomString } from "@/lib/utils";
import { InputProps } from "../client";
import { Value } from "./_sub-section/value";
import { Apply } from "./_sub-section/apply";
import { SelectApply } from "./_sub-section/select-apply";
import { Selected } from "./_sub-section/selected";
import {
  ProductTransformed,
  useGetSelects,
  useGetSelectsProducts,
} from "../../_api";

export interface SelectProduct {
  data: ProductTransformed[];
}

interface DiscountCoreProps {
  input: InputProps;
  setInput: React.Dispatch<React.SetStateAction<InputProps>>;
  value: string;
  apply: string;
  setDiscounts: (e: any) => void;
}

export const DiscountCore = ({
  input,
  setInput,
  value,
  apply,
  setDiscounts,
}: DiscountCoreProps) => {
  const { data } = useGetSelects();
  const { data: selectProducts } = useGetSelectsProducts();

  const categories = React.useMemo(() => {
    return data?.data.categories ?? [];
  }, [data]);
  const suppliers = React.useMemo(() => {
    return data?.data.suppliers ?? [];
  }, [data]);
  const pets = React.useMemo(() => {
    return data?.data.pets ?? [];
  }, [data]);

  const handleRemoveApply = (item: any) => {
    setInput((prev) => ({
      ...prev,
      selected: prev.selected.filter((i) => i !== item),
    }));
  };

  const handleGenerateVoucher = (e: MouseEvent) => {
    e.preventDefault();
    setInput((prev) => ({ ...prev, voucher: generateRandomString(12) }));
  };
  return (
    <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-4 justify-between">
          <Label>Discount code</Label>
          <Button
            className="h-fit py-0 underline-offset-1 text-blue-500 text-xs"
            variant={"link"}
            onClick={handleGenerateVoucher}
          >
            Generate random code
          </Button>
        </div>
        <Input
          className="focus-visible:ring-0 shadow-none border-gray-300 focus-visible:border-gray-500"
          value={input.voucher}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, voucher: e.target.value }))
          }
        />
      </div>
      <Value
        value={value}
        input={input}
        setDiscounts={setDiscounts}
        setInput={setInput}
      />
      <Apply setDiscounts={setDiscounts} setInput={setInput} apply={apply} />
      <SelectApply
        apply={apply}
        categories={categories}
        handleRemoveApply={handleRemoveApply}
        input={input}
        pets={pets}
        selectProducts={selectProducts}
        setInput={setInput}
        suppliers={suppliers}
      />
      {input.selected.length > 0 && (
        <Selected
          apply={apply}
          categories={categories}
          input={input}
          handleRemoveApply={handleRemoveApply}
          pets={pets}
          selectProducts={selectProducts}
          suppliers={suppliers}
        />
      )}
    </div>
  );
};
