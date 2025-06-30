import { LabelInput } from "@/components/label-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import React from "react";

export const VariantOpen = ({
  variant,
  idx,
  variants,
  handleChangeVariant,
  setVariants,
  disabled,
}: {
  variant: any;
  idx: number;
  variants: any[];
  handleChangeVariant: any;
  setVariants: any;
  disabled: boolean;
}) => {
  const handleRemove = () => {
    setVariants((prev: any) =>
      prev.filter((item: any) => item.id !== variant.id)
    );
  };

  const handleDone = () =>
    setVariants((prev: any) =>
      prev.map((item: any) =>
        item.id === variant.id ? { ...item, isOpen: false } : item
      )
    );
  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-3",
        idx !== variants.length - 1 && "border-b"
      )}
    >
      <div className="border w-full rounded-sm flex flex-col">
        <div className="px-3 py-5 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <LabelInput
              label="Variant name"
              placeholder="e.g. 30L"
              value={variant.name}
              onChange={(e) =>
                handleChangeVariant(variant.id, "name", e.target.value)
              }
              disabled={disabled}
            />
          </div>
        </div>
        <Separator />
        <div className="px-3 py-5 flex flex-col gap-5">
          <h5 className="font-bold underline underline-offset-4 text-sm">
            Inventory
          </h5>
          <div className="flex items-center gap-3">
            <LabelInput
              label="SKU"
              placeholder="e.g. FOURCIDE-EMV"
              value={variant.sku}
              onChange={(e) =>
                handleChangeVariant(variant.id, "sku", e.target.value)
              }
              disabled={disabled}
            />
            <LabelInput
              label="Barcode"
              placeholder="e.g. r93edi067"
              value={variant.barcode}
              onChange={(e) =>
                handleChangeVariant(variant.id, "barcode", e.target.value)
              }
              disabled={disabled}
            />
            <LabelInput
              label="Stock"
              placeholder="e.g. 1000"
              classContainer="w-32 flex-none"
              value={variant.quantity}
              onChange={(e) =>
                handleChangeVariant(variant.id, "quantity", e.target.value)
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
          <div className="flex items-center gap-3">
            <LabelInput
              label="Price"
              type="number"
              placeholder="e.g. 10000"
              value={variant.salePrice}
              onChange={(e) =>
                handleChangeVariant(variant.id, "salePrice", e.target.value)
              }
              disabled={disabled}
            />
            <LabelInput
              label="Compare-at price"
              type="number"
              placeholder="e.g. 10000"
              value={variant.compareAtPrice}
              onChange={(e) =>
                handleChangeVariant(
                  variant.id,
                  "compareAtPrice",
                  e.target.value
                )
              }
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
                className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none"
                placeholder="e.g. 100"
                value={variant.weight}
                onChange={(e) =>
                  handleChangeVariant(variant.id, "weight", e.target.value)
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
        >
          Delete
        </Button>
        <Button
          onClick={handleDone}
          className="px-3 py-0.5 text-xs h-7"
          disabled={disabled}
        >
          Done
        </Button>
      </div>
    </div>
  );
};
