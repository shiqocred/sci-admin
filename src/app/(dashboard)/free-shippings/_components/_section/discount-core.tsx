import React from "react";
import { InputProps } from "../client";
import { Apply } from "./_sub-section/apply";
import { SelectApply } from "./_sub-section/select-apply";
import { Selected } from "./_sub-section/selected";
import {
  ProductTransformed,
  useGetSelects,
  useGetSelectsProducts,
} from "../../_api";
import { LabelInput } from "@/components/label-input";
import { MessageInputError } from "@/components/message-input-error";

export interface SelectProduct {
  data: ProductTransformed[];
}

interface DiscountCoreProps {
  input: InputProps;
  setInput: React.Dispatch<React.SetStateAction<InputProps>>;
  apply: string;
  setDiscounts: (e: any) => void;
  errors: {
    name: string;
    apply: string;
  };
}

export const DiscountCore = ({
  input,
  setInput,
  apply,
  setDiscounts,
  errors,
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

  return (
    <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <LabelInput
          label="Name"
          value={input.name}
          classLabel="required"
          onChange={(e) =>
            setInput((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Type name free shipping"
        />
        <MessageInputError error={errors.name} />
      </div>
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
      <MessageInputError error={errors.apply} />
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
