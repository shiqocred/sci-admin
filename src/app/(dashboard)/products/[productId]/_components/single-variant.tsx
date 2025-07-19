import { LabelInput } from "@/components/label-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import React, { ChangeEvent } from "react";

export const SingleVariant = ({
  defaultVariants,
  setDefaultVariants,
  disabled,
}: {
  defaultVariants: any;
  setDefaultVariants: any;
  disabled: boolean;
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setDefaultVariants((prev: any) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  return (
    <div className="bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col">
      <div className="px-3 py-5 flex flex-col gap-5">
        <h5 className="font-bold underline underline-offset-4 text-sm">
          Inventory
        </h5>
        <div className="flex items-center gap-3">
          <LabelInput
            label="SKU"
            placeholder="e.g. FOURCIDE-EMV"
            value={defaultVariants.sku}
            id="sku"
            onChange={handleChange}
            disabled={disabled}
          />
          <LabelInput
            label="Barcode"
            placeholder="e.g. r93edi067"
            value={defaultVariants.barcode}
            id="barcode"
            onChange={handleChange}
            disabled={disabled}
          />
          <LabelInput
            label="Stock"
            placeholder="e.g. 1000"
            value={defaultVariants.quantity}
            classContainer="w-32 flex-none"
            id="quantity"
            onChange={handleChange}
            disabled={disabled}
          />
        </div>
      </div>
      <Separator />
      <div className="px-3 py-5 flex flex-col gap-5">
        <h5 className="font-bold underline underline-offset-4 text-sm">
          Pricing
        </h5>
        <div className="grid grid-cols-2 gap-3">
          <LabelInput
            label="Normal price"
            type="number"
            placeholder="e.g. 10000"
            value={defaultVariants.normalPrice}
            id="normalPrice"
            onChange={handleChange}
            disabled={disabled}
          />
          <LabelInput
            label="Basic price"
            type="number"
            placeholder="e.g. 10000"
            value={defaultVariants.basicPrice}
            id="basicPrice"
            onChange={handleChange}
            disabled={disabled}
          />
          <LabelInput
            label="Pet shop price"
            type="number"
            placeholder="e.g. 10000"
            value={defaultVariants.petShopPrice}
            id="petShopPrice"
            onChange={handleChange}
            disabled={disabled}
          />
          <LabelInput
            label="Doctor price"
            type="number"
            placeholder="e.g. 10000"
            value={defaultVariants.doctorPrice}
            id="doctorPrice"
            onChange={handleChange}
            disabled={disabled}
          />
        </div>
      </div>
      <Separator />
      <div className="px-3 py-5 flex flex-col gap-5">
        <h5 className="font-bold underline underline-offset-4 text-sm">
          Shipping
        </h5>
        <div className="flex flex-col gap-1.5 w-full">
          <Label htmlFor="weight">Weight</Label>
          <div className="flex items-center relative">
            <Input
              value={defaultVariants.weight}
              className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none"
              placeholder="e.g. 100"
              id="weight"
              onChange={handleChange}
              disabled={disabled}
            />
            <p className="absolute right-3 text-xs py-0.5 font-medium px-2 bg-gray-300 rounded-md">
              Gram
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
