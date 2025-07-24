import { LabelInput } from "@/components/label-input";
import { MessageInputError } from "@/components/message-input-error";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn, numericString } from "@/lib/utils";
import React, { ChangeEvent, useState } from "react";

export const SingleVariant = ({
  defaultVariants,
  setDefaultVariants,
  disabled,
  errors,
}: {
  defaultVariants: any;
  setDefaultVariants: any;
  disabled: boolean;
  errors: any;
}) => {
  const [isAllPrice, setIsAllPrice] = useState<boolean | "indeterminate">(true);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    isNumeric?: boolean
  ) => {
    const { id, value } = e.target;
    const processedValue = isNumeric ? numericString(value) : value;

    if (id === "normalPrice" && isAllPrice) {
      setDefaultVariants((prev: any) => ({
        ...prev,
        normalPrice: processedValue,
        basicPrice: processedValue,
        petShopPrice: processedValue,
        doctorPrice: processedValue,
      }));
    } else {
      setDefaultVariants((prev: any) => ({
        ...prev,
        [id]: processedValue,
      }));
    }
  };

  return (
    <div className="bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col">
      <div className="px-3 py-5 flex flex-col gap-5">
        <h5 className="font-bold underline underline-offset-4 text-sm">
          Inventory
        </h5>
        <div className="flex items-start gap-3">
          <div className="flex flex-col w-full gap-1.5">
            <LabelInput
              label="SKU"
              placeholder="e.g. FOURCIDE-EMV"
              value={defaultVariants.sku}
              id="sku"
              className={cn(
                errors?.["defaultVariant.sku"] &&
                  "border-red-500 hover:border-red-500"
              )}
              onChange={handleChange}
              disabled={disabled}
            />
            <MessageInputError error={errors?.["defaultVariant.sku"]} />
          </div>
          <div className="flex flex-col w-full gap-1.5">
            <LabelInput
              label="Barcode"
              placeholder="e.g. r93edi067"
              value={defaultVariants.barcode}
              id="barcode"
              className={cn(
                errors?.["defaultVariant.barcode"] &&
                  "border-red-500 hover:border-red-500"
              )}
              onChange={handleChange}
              disabled={disabled}
            />
            <MessageInputError error={errors?.["defaultVariant.barcode"]} />
          </div>
          <LabelInput
            label="Stock"
            placeholder="e.g. 1000"
            type="number"
            value={defaultVariants.quantity}
            classContainer="w-32 flex-none"
            id="quantity"
            onChange={(e) => handleChange(e, true)}
            disabled={disabled}
          />
        </div>
      </div>
      <Separator />
      <div className="px-3 py-5 flex flex-col gap-5">
        <h5 className="font-bold underline underline-offset-4 text-sm">
          Pricing
        </h5>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <LabelInput
              label="Normal price"
              type="number"
              placeholder="e.g. 10000"
              value={defaultVariants.normalPrice}
              id="normalPrice"
              onChange={(e) => handleChange(e, true)}
              disabled={disabled}
              isPricing
            />
            <div className="flex gap-2 h-9 mt-auto items-center">
              <Label>
                <Checkbox
                  checked={isAllPrice}
                  onCheckedChange={setIsAllPrice}
                />
                <span className="text-xs">Apply to all price</span>
              </Label>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <LabelInput
              label="Basic price"
              type="number"
              placeholder="e.g. 10000"
              value={defaultVariants.basicPrice}
              id="basicPrice"
              onChange={(e) => handleChange(e, true)}
              disabled={disabled}
              isPricing
            />
            <LabelInput
              label="Pet shop price"
              type="number"
              placeholder="e.g. 10000"
              value={defaultVariants.petShopPrice}
              id="petShopPrice"
              onChange={(e) => handleChange(e, true)}
              disabled={disabled}
              isPricing
            />
            <LabelInput
              label="Doctor price"
              type="number"
              placeholder="e.g. 10000"
              value={defaultVariants.doctorPrice}
              id="doctorPrice"
              onChange={(e) => handleChange(e, true)}
              disabled={disabled}
              isPricing
            />
          </div>
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
              onChange={(e) => handleChange(e, true)}
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
