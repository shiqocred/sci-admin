"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartNoAxesGantt, ChevronRight, Save } from "lucide-react";
import React, { MouseEvent, useEffect, useState } from "react";
import { useCreateProduct } from "../_api";
import {
  ProductCore,
  ProductDescription,
  SingleVariant,
  MultipleVariant,
  ReferenceMenu,
} from "../../_components/_sections";
import Link from "next/link";
interface CompositionProps {
  id: string;
  name: string;
  value: string;
}

interface VariantsProps {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  quantity: string;
  normalPrice: string;
  basicPrice: string;
  petShopPrice: string;
  doctorPrice: string;
  weight: string;
  isOpen: boolean;
}

const initialValue = {
  title: "",
  description: "",
  indication: "",
  dosageUsage: "",
  storageInstruction: "",
  packaging: "",
  registrationNumber: "",
  isActive: false,
  categoryId: "",
  supplierId: "",
};

const initialDefaultVariant = {
  id: "",
  name: "default",
  sku: "",
  barcode: "",
  quantity: "0",
  normalPrice: "0",
  basicPrice: "0",
  petShopPrice: "0",
  doctorPrice: "0",
  weight: "0",
};

export const Client = () => {
  const [isVariant, setIsVariant] = useState<boolean | "indeterminate">(false);
  const [imagesProduct, setImagesProduct] = useState<File[] | null>(null);
  const [compositionItem, setCompositionItem] = useState({
    name: "",
    value: "",
  });
  const [input, setInput] = useState(initialValue);
  const [petIds, setPetIds] = useState<string[]>([]);
  const [compositions, setCompositions] = useState<CompositionProps[]>([]);
  const [defaultVariants, setDefaultVariants] = useState(initialDefaultVariant);
  const [variants, setVariants] = useState<VariantsProps[]>([]);

  const [errors, setErrors] = useState<any>();

  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();

  const handleOnChange = (id: string, value: string) => {
    setInput((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: MouseEvent) => {
    e.preventDefault();
    const body = new FormData();

    body.set("title", input.title);
    imagesProduct?.forEach((img) => body.append("image", img)); // <-- gunakan append!

    body.set("description", input.description);
    body.set("indication", input.indication);
    body.set("dosageUsage", input.dosageUsage);
    body.set("storageInstruction", input.storageInstruction);
    body.set("packaging", input.packaging);
    body.set("registrationNumber", input.registrationNumber);
    body.set("isActive", input.isActive.toString());
    body.set("categoryId", input.categoryId);
    body.set("supplierId", input.supplierId);

    // Pet many-to-many
    body.set("petId", JSON.stringify(petIds)); // <-- kirim sebagai array string

    body.set("compositions", JSON.stringify(compositions));
    if (isVariant) {
      body.append(
        "variants",
        JSON.stringify(
          variants.map((item) => ({
            id: item.id,
            name: item.name,
            sku: item.sku,
            stock: item.quantity,
            normalPrice: item.normalPrice,
            basicPrice: item.basicPrice,
            petShopPrice: item.petShopPrice,
            doctorPrice: item.doctorPrice,
            weight: item.weight,
            barcode: item.barcode,
          }))
        )
      );
    } else {
      body.append(
        "defaultVariant",
        JSON.stringify({
          id: defaultVariants.id,
          name: defaultVariants.name,
          sku: defaultVariants.sku,
          stock: defaultVariants.quantity,
          normalPrice: defaultVariants.normalPrice,
          basicPrice: defaultVariants.basicPrice,
          petShopPrice: defaultVariants.petShopPrice,
          doctorPrice: defaultVariants.doctorPrice,
          weight: defaultVariants.weight,
          barcode: defaultVariants.barcode,
        })
      );
    }

    createProduct(
      { body },
      {
        onError: (data) => {
          setErrors((data.response?.data as any).errors);
        },
      }
    );
  };

  useEffect(() => {
    if (isNaN(parseFloat(defaultVariants.normalPrice))) {
      setDefaultVariants((prev) => ({ ...prev, normalPrice: "0" }));
    }
    if (isNaN(parseFloat(defaultVariants.basicPrice))) {
      setDefaultVariants((prev) => ({ ...prev, basicPrice: "0" }));
    }
    if (isNaN(parseFloat(defaultVariants.petShopPrice))) {
      setDefaultVariants((prev) => ({ ...prev, petShopPrice: "0" }));
    }
    if (isNaN(parseFloat(defaultVariants.doctorPrice))) {
      setDefaultVariants((prev) => ({ ...prev, doctorPrice: "0" }));
    }
    if (isNaN(parseFloat(defaultVariants.quantity))) {
      setDefaultVariants((prev) => ({ ...prev, quantity: "0" }));
    }
    if (isNaN(parseFloat(defaultVariants.weight))) {
      setDefaultVariants((prev) => ({ ...prev, weight: "0" }));
    }
  }, [defaultVariants]);

  return (
    <div className="w-full flex flex-col gap-6 pb-20">
      <div className="w-full flex items-center gap-2">
        <Button
          size={"icon"}
          variant={"secondary"}
          className="size-7 hover:bg-gray-200"
          asChild
        >
          <Link href="/products">
            <ChartNoAxesGantt className="size-5" />
          </Link>
        </Button>
        <ChevronRight className="size-4 text-gray-500" />
        <h1 className="text-xl font-semibold">Add Products</h1>
      </div>
      <div className="w-full grid grid-cols-3 gap-6">
        <div className="col-span-2 w-full flex flex-col gap-4">
          <ProductCore
            input={input}
            handleOnChange={handleOnChange}
            disabled={isCreating}
            setImagesProduct={setImagesProduct}
            errors={errors}
          />
          <ProductDescription
            input={input}
            handleOnChange={handleOnChange}
            compositions={compositions}
            setCompositions={setCompositions}
            disabled={isCreating}
            compositionItem={compositionItem}
            setCompositionItem={setCompositionItem}
            errors={errors}
          />

          <div className="w-full flex items-center gap-2 px-3 py-5 bg-gradient-to-br from-gray-100 to-gray-200 border rounded-lg border-gray-300">
            <Label>
              <Checkbox
                className="border-gray-400"
                checked={isVariant}
                onCheckedChange={setIsVariant}
              />
              <span>Product with variant</span>
            </Label>
          </div>
          {isVariant ? (
            <MultipleVariant
              setVariants={setVariants}
              variants={variants}
              disabled={isCreating}
              errors={errors}
            />
          ) : (
            <SingleVariant
              defaultVariants={defaultVariants}
              setDefaultVariants={setDefaultVariants}
              disabled={isCreating}
              errors={errors}
            />
          )}
        </div>
        <div className="col-span-1 w-full relative">
          <div className="flex flex-col gap-3 sticky top-3">
            <ReferenceMenu
              loading={isCreating}
              setPetIds={setPetIds}
              petIds={petIds}
              input={input}
              setInput={setInput}
              errors={errors}
            />
            <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5 w-full">
                <Label>Status</Label>
                <Select
                  value={input.isActive ? "publish" : "draft"}
                  onValueChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      isActive: e === "publish",
                    }))
                  }
                >
                  <SelectTrigger className="bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 w-full">
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent
                    className="min-w-[var(--radix-popover-trigger-width)] p-0"
                    align="end"
                  >
                    <SelectGroup>
                      <SelectItem value="publish">Publish</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmit}>
                <Save />
                Create
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
