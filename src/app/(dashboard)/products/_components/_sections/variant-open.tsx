import { LabelInput } from "@/components/label-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn, numericString } from "@/lib/utils";
import React, { FormEvent, useState } from "react";

export const VariantOpen = ({
  variant,
  idx,
  variants,
  setVariants,
  disabled,
  errors,
  available,
}: {
  variant: any;
  idx: number;
  variants: any[];
  setVariants: any;
  disabled: boolean;
  errors: any;
  available: string[];
}) => {
  const [isAllPrice, setIsAllPrice] = useState<boolean | "indeterminate">(true);
  console.log(available);

  const handleChangeVariant = (
    id: string,
    field: keyof (typeof variants)[number],
    value: string | boolean,
    isNumeric?: boolean
  ) => {
    const sanitizeNumeric = (val: string): string => {
      const num = parseFloat(val);
      return isNaN(num) ? "0" : numericString(val);
    };

    setVariants((prev: any) =>
      prev.map((item: any) => {
        if (item.id !== id) return item;

        if (field === "normalPrice" && isAllPrice) {
          const numericValue = isNumeric
            ? sanitizeNumeric(value as string)
            : value;
          return {
            ...item,
            normalPrice: numericValue as string,
            basicPrice: numericValue as string,
            petShopPrice: numericValue as string,
            doctorPrice: numericValue as string,
          };
        } else {
          return {
            ...item,
            [field]: isNumeric ? sanitizeNumeric(value as string) : value,
          };
        }
      })
    );
  };

  const handleRemove = () => {
    setVariants((prev: any) =>
      prev.filter((item: any) => item.id !== variant.id)
    );
  };

  const handleDone = (e: FormEvent) => {
    e.preventDefault();
    setVariants((prev: any) =>
      prev.map((item: any) =>
        item.id === variant.id ? { ...item, isOpen: false } : item
      )
    );
  };

  return (
    <form
      onSubmit={handleDone}
      className={cn(
        "flex flex-col gap-3 p-3",
        idx !== variants.length - 1 && "border-b"
      )}
    >
      <div className="border w-full rounded-sm flex flex-col">
        <div className="px-3 py-5 flex flex-col gap-5">
          <div className="flex flex-col w-full gap-1.5">
            <LabelInput
              label="Variant name"
              placeholder="e.g. 30L"
              value={variant.name}
              onChange={(e) =>
                handleChangeVariant(variant.id, "name", e.target.value)
              }
              disabled={disabled}
              className={cn(
                errors[idx]?.name && "border-red-500 hover:border-red-500"
              )}
            />
            {errors[idx]?.name && (
              <p className="text-xs text-red-500 before:content-['*'] pl-3">
                {errors[idx]?.name}
              </p>
            )}
          </div>
        </div>
        <Separator />
        <div className="px-3 py-5 flex flex-col gap-5">
          <h5 className="font-bold underline underline-offset-4 text-sm">
            Inventory
          </h5>
          <div className="flex items-start gap-3">
            <div className="flex flex-col gap-1.5 w-full">
              <LabelInput
                label="SKU"
                placeholder="e.g. FOURCIDE-EMV"
                value={variant.sku}
                onChange={(e) =>
                  handleChangeVariant(variant.id, "sku", e.target.value)
                }
                disabled={disabled}
                className={cn(
                  errors[idx]?.sku && "border-red-500 hover:border-red-500"
                )}
              />
              {errors[idx]?.sku && (
                <p className="text-xs text-red-500 before:content-['*'] pl-3">
                  {errors[idx]?.sku}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <LabelInput
                label="Barcode"
                placeholder="e.g. r93edi067"
                value={variant.barcode}
                onChange={(e) =>
                  handleChangeVariant(variant.id, "barcode", e.target.value)
                }
                disabled={disabled}
                className={cn(
                  errors[idx]?.barcode && "border-red-500 hover:border-red-500"
                )}
              />
              {errors[idx]?.barcode && (
                <p className="text-xs text-red-500 before:content-['*'] pl-3">
                  {errors[idx]?.barcode}
                </p>
              )}
            </div>
            <LabelInput
              label="Stock"
              placeholder="e.g. 1000"
              classContainer="w-32 flex-none"
              type="number"
              value={variant.quantity}
              onChange={(e) =>
                handleChangeVariant(
                  variant.id,
                  "quantity",
                  e.target.value,
                  true
                )
              }
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
                value={variant.normalPrice}
                id="normalPrice"
                onChange={(e) =>
                  handleChangeVariant(
                    variant.id,
                    "normalPrice",
                    e.target.value,
                    true
                  )
                }
                disabled={disabled}
                isPricing
              />
              {available.length > 0 && (
                <div className="flex gap-2 h-9 mt-auto items-center">
                  <Label>
                    <Checkbox
                      checked={isAllPrice}
                      onCheckedChange={setIsAllPrice}
                    />
                    <span className="text-xs">Apply to all price</span>
                  </Label>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {available.some((i) => i === "basic") && (
                <LabelInput
                  label="Pet owner price"
                  type="number"
                  placeholder="e.g. 10000"
                  value={variant.basicPrice}
                  id="basicPrice"
                  onChange={(e) =>
                    handleChangeVariant(
                      variant.id,
                      "basicPrice",
                      e.target.value,
                      true
                    )
                  }
                  disabled={disabled}
                  isPricing
                />
              )}
              {available.some((i) => i === "petshop") && (
                <LabelInput
                  label="Pet shop price"
                  type="number"
                  placeholder="e.g. 10000"
                  value={variant.petShopPrice}
                  id="petShopPrice"
                  onChange={(e) =>
                    handleChangeVariant(
                      variant.id,
                      "petShopPrice",
                      e.target.value,
                      true
                    )
                  }
                  disabled={disabled}
                  isPricing
                />
              )}
              {available.some((i) => i === "veterinarian") && (
                <LabelInput
                  label="Vet clinic price"
                  type="number"
                  placeholder="e.g. 10000"
                  value={variant.doctorPrice}
                  id="doctorPrice"
                  onChange={(e) =>
                    handleChangeVariant(
                      variant.id,
                      "doctorPrice",
                      e.target.value,
                      true
                    )
                  }
                  disabled={disabled}
                  isPricing
                />
              )}
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
                className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none"
                placeholder="e.g. 100"
                value={variant.weight}
                onChange={(e) =>
                  handleChangeVariant(
                    variant.id,
                    "weight",
                    e.target.value,
                    true
                  )
                }
                disabled={disabled}
              />
              <p className="absolute right-3 text-xs py-0.5 font-medium px-2 bg-gray-300 rounded-md">
                Gram
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button
          className="px-3 py-0.5 text-xs h-7 text-red-500 hover:text-red-600 hover:bg-red-100 shadow-none border-red-300"
          variant={"outline"}
          onClick={handleRemove}
          disabled={disabled}
          type="button"
        >
          Delete
        </Button>
        <Button
          type="submit"
          className="px-3 py-0.5 text-xs h-7"
          disabled={disabled}
        >
          Done
        </Button>
      </div>
    </form>
  );
};
