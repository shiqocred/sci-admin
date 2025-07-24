import { LabelInput } from "@/components/label-input";
import { Button } from "@/components/ui/button";
import { cn, generateRandomNumber } from "@/lib/utils";
import { Edit3, PlusCircle, Tag } from "lucide-react";
import React, { FormEvent, useState } from "react";
import { VariantOpen } from "./variant-open";
import { toast } from "sonner";

const initialValue = {
  name: "",
  sku: "",
  barcode: "",
  quantity: "0",
  normalPrice: "0",
  basicPrice: "0",
  petShopPrice: "0",
  doctorPrice: "0",
  weight: "0",
  isOpen: true,
};

// Ubah menjadi array errors per variant
const transformErrors = (errors: Record<string, string>) => {
  const variantErrors: Record<number, Record<string, string>> = {};

  Object.keys(errors).forEach((key) => {
    if (key.startsWith("variants.")) {
      const match = key.match(/variants\.(\d+)\.(.+)/);
      if (match) {
        const index = parseInt(match[1]);
        const field = match[2];

        if (!variantErrors[index]) {
          variantErrors[index] = {};
        }
        variantErrors[index][field] = errors[key];
      }
    }
  });

  return variantErrors;
};

export const MultipleVariant = ({
  variants,
  setVariants,
  disabled,
  errors,
}: {
  variants: any;
  setVariants: any;
  disabled: boolean;
  errors: any;
}) => {
  const [variantItem, setVariantItem] = useState(initialValue);
  const transformedErrors = transformErrors(errors ?? {});

  const handleOpen = (id: string) =>
    setVariants((prev: any) =>
      prev.map((item: any) =>
        item.id === id ? { ...item, isOpen: true } : item
      )
    );

  const handleAddVariant = (e: FormEvent) => {
    e.preventDefault();
    const isNameExists = variants.some(
      (variant: any) =>
        variant.name.toLowerCase() === variantItem.name.toLowerCase()
    );

    if (isNameExists) {
      toast.error("Variant name already exists!");
      return; // Hentikan eksekusi jika nama sudah ada
    }

    // Cek apakah name tidak kosong
    if (!variantItem.name.trim()) {
      toast.error("Variant name is required!");
      return;
    }
    setVariants((prev: any) => [
      ...prev,
      { id: generateRandomNumber(3), ...variantItem },
    ]);
    setVariantItem((prev) => ({ ...prev, name: "" }));
  };

  return (
    <div className="bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col px-5 py-3 gap-5">
      <h5 className="font-bold underline underline-offset-4 text-sm">
        Variants
      </h5>
      <div className="border rounded-md overflow-hidden">
        <form
          onSubmit={handleAddVariant}
          className={cn(
            "flex items-end p-3 gap-3",
            variants.length > 0 && "border-b bg-gray-200"
          )}
        >
          <LabelInput
            label="Variant name"
            className={cn(variants.length > 0 && "border-gray-400")}
            placeholder="e.g. 30L"
            value={variantItem.name}
            onChange={(e) =>
              setVariantItem((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            disabled={disabled}
          />
          <Button type="submit" disabled={disabled}>
            <PlusCircle className="size-3.5" />
            <p className="text-xs">Add Variant</p>
          </Button>
        </form>
        {variants.map((variant: any, idx: number) =>
          variant.isOpen ? (
            <VariantOpen
              key={variant.id}
              variant={variant}
              idx={idx}
              variants={variants}
              setVariants={setVariants}
              disabled={disabled}
              errors={transformedErrors}
            />
          ) : (
            <Button
              key={variant.id}
              className={cn(
                "h-auto px-3 py-3 w-full rounded-none justify-between group",
                idx !== variants.length - 1 && "border-b"
              )}
              variant={"ghost"}
              onClick={() => handleOpen(variant.id)}
              disabled={disabled}
            >
              <div className="flex items-center gap-3 text-sm">
                <Tag className="size-3" />
                <p>{variant.name}</p>
              </div>
              <Edit3 className="size-3.5 text-gray-400 group-hover:flex hidden mr-3" />
            </Button>
          )
        )}
      </div>
    </div>
  );
};
