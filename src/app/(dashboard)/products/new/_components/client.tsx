"use client";

import { LabelInput } from "@/components/label-input";
import { RichInput } from "@/components/rich-editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn, generateRandomNumber } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import {
  ChevronDown,
  Edit3,
  InfoIcon,
  PlusCircle,
  Tag,
  Trash2,
} from "lucide-react";
import React, { ChangeEvent, Fragment, useEffect, useState } from "react";

export const Client = () => {
  const [isVariant, setIsVariant] = useState<boolean | "indeterminate">(false);
  const [input, setInput] = useState({
    title: "",
    image: null as File | null,
    description: "",
    indication: "",
    dosageUsage: "",
    storageInstruction: "",
    registrationNumber: "",
    isActive: false,
    categoryId: "",
    supplierId: "",
    petId: "",
  });
  const [defaultVariant, setDefaultVariant] = useState({
    price: 0,
    comparePrice: 0,
    weight: 0,
  });
  const [variants, setVariants] = useState<
    {
      id: string;
      name: string;
      option: { id: string; value: string }[];
      isActive: boolean;
    }[]
  >([]);
  const [combo, setCombo] = useState<
    {
      sku: string;
      barcode: string;
      quantity: string;
      salePrice: string;
      compareAtPrice: string;
      weight: string;
      items: Record<string, string>;
    }[]
  >([]);

  const [variantErrors, setVariantErrors] = useState<
    Record<string, string | null>
  >({});

  const handleRemoveVariant = (idx: number) =>
    setVariants((prev) => prev.filter((_, i) => i !== idx));

  const handleActiveVariant = (idx: number, active: boolean) =>
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, isActive: active } : v))
    );

  const handleChange = (
    variantIndex: number,
    optionId: string,
    value: string
  ) => {
    setVariants((prev) => {
      const updated = [...prev];
      const targetVariant = updated[variantIndex];

      let updatedOptions = targetVariant.option.map((opt) =>
        opt.id === optionId ? { ...opt, value } : opt
      );

      // Hapus jika kosong dan bukan satu-satunya
      updatedOptions = updatedOptions.filter(
        (opt) => opt.value.trim() !== "" || updatedOptions.length === 1
      );

      // Tambah field kosong jika terakhir diisi
      const last = updatedOptions[updatedOptions.length - 1];
      if (last && last.id === optionId && value.trim() !== "") {
        updatedOptions.push({ id: generateRandomNumber(3), value: "" });
      }

      // Cek duplikat dan set error
      const trimmedValues = updatedOptions
        .map((o) => o.value.trim())
        .filter((v) => v !== "");
      const duplicates = trimmedValues.filter(
        (v, i, arr) => arr.indexOf(v) !== i
      );

      const newErrors: Record<string, string | null> = {};
      updatedOptions.forEach((opt) => {
        if (opt.value.trim() !== "" && duplicates.includes(opt.value.trim())) {
          newErrors[opt.id] = "Duplicate option";
        } else {
          newErrors[opt.id] = null;
        }
      });

      setVariantErrors((prev) => ({ ...prev, ...newErrors }));

      updated[variantIndex] = {
        ...targetVariant,
        option:
          updatedOptions.length > 0
            ? updatedOptions
            : [{ id: generateRandomNumber(3), value: "" }],
      };
      return updated;
    });
  };

  const handleChangeVariantName = (index: number, value: string) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        name: value,
      };
      return updated;
    });
  };

  const handleRemoveOption = (variantIndex: number, optionId: string) => {
    setVariants((prev) => {
      const updated = [...prev];
      const options = updated[variantIndex].option.filter(
        (opt) => opt.id !== optionId
      );

      updated[variantIndex].option =
        options.length > 0
          ? options
          : [{ id: generateRandomNumber(3), value: "" }];

      return updated;
    });
  };

  function generateCombinations(
    variants: {
      id: string;
      name: string;
      option: {
        id: string;
        value: string;
      }[];
      isActive: boolean;
    }[]
  ): Record<string, string>[] {
    const variantNames = variants.map((v) => v.name);
    const variantOptions = variants.map((v) =>
      v.option.map((o) => o.value.trim()).filter((v) => v !== "")
    );

    if (variantOptions.some((opts) => opts.length === 0)) return [];

    const combinations: Record<string, string>[] = [];

    const generate = (prefix: string[], index: number) => {
      if (index === variantOptions.length) {
        const combo: Record<string, string> = {};
        prefix.forEach((val, i) => {
          combo[variantNames[i].toLowerCase()] = val;
        });
        combinations.push(combo);
        return;
      }

      for (const opt of variantOptions[index]) {
        generate([...prefix, opt], index + 1);
      }
    };

    generate([], 0);
    return combinations;
  }

  const handleChangeVariantCombo = (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setCombo((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [e.target.id]: e.target.value,
      };
      return updated;
    });
  };

  useEffect(() => {
    const newCombos = generateCombinations(variants);

    setCombo((prev) =>
      newCombos.map((comboItem) => {
        const existing = prev.find(
          (c) => JSON.stringify(c.items) === JSON.stringify(comboItem)
        );

        return (
          existing || {
            sku: "",
            barcode: "",
            quantity: "",
            salePrice: "",
            compareAtPrice: "",
            weight: "",
            items: comboItem,
          }
        );
      })
    );
  }, [variants]);
  console.log(combo);

  return (
    <div className="w-full flex flex-col gap-6 pb-20">
      <div className="w-full flex items-center gap-4">
        <h1 className="text-xl font-semibold">Add Products</h1>
      </div>
      <div className="w-full grid grid-cols-3 gap-6">
        <div className="col-span-2 w-full flex flex-col gap-4">
          <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
            <LabelInput label="Title" placeholder="e.g. Obat Kutu Kucing" />
            <div className="flex flex-col gap-1.5 w-full">
              <Label>Images</Label>
              <Button
                className="w-full h-28 bg-transparent border-gray-300 border-dashed hover:bg-gray-100 hover:border-gray-400 shadow-none"
                variant={"outline"}
              >
                Upload Gambar
              </Button>
            </div>
          </div>
          <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 w-full">
              <Label>Description</Label>
              <Textarea className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none min-h-24" />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <Label>Indication</Label>
              <RichInput />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <Label>Dosage & Usage</Label>
              <RichInput />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <Label>Storage Instruction</Label>
              <Textarea className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none min-h-24" />
            </div>
            <LabelInput label="Packaging" />
            <LabelInput label="Registration number" />
          </div>
          <div className="w-full flex items-center gap-2 px-3 py-5 bg-gray-100 border rounded-lg border-gray-300">
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
            <>
              <div className="bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col px-3 py-5 gap-5">
                <h5 className="font-bold underline underline-offset-4 text-sm">
                  Variants
                </h5>
                <div className="flex flex-col overflow-hidden">
                  <div className="border border-gray-300 rounded-t-md w-full border-b-0">
                    {variants.map((item, idx) => (
                      <Fragment key={`${item.id}-${idx}`}>
                        {item.isActive ? (
                          <div
                            className={cn(
                              "p-5 flex flex-col gap-3",
                              variants.length > 1 && "border-b border-gray-300"
                            )}
                          >
                            <LabelInput
                              label="Option name"
                              placeholder="e.g. Weight"
                              onChange={(e) =>
                                handleChangeVariantName(idx, e.target.value)
                              }
                              value={item.name}
                            />
                            <div className="flex flex-col gap-1.5">
                              <Label>Option values</Label>
                              <div className="flex flex-col gap-2">
                                {item.option.map((opt, i) => (
                                  <div
                                    key={opt.id}
                                    className="flex flex-col gap-1 relative"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Input
                                        placeholder={
                                          i === 0
                                            ? "e.g. L, XL"
                                            : "Add another option"
                                        }
                                        value={opt.value}
                                        onChange={(e) =>
                                          handleChange(
                                            idx,
                                            opt.id,
                                            e.target.value
                                          )
                                        }
                                        className={cn(
                                          "focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none placeholder:text-xs",
                                          variantErrors[opt.id] &&
                                            "border-red-500 focus-visible:border-red-500"
                                        )}
                                      />
                                      {item.option.length > 1 &&
                                        opt.value !== "" && (
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() =>
                                              handleRemoveOption(idx, opt.id)
                                            }
                                          >
                                            <Trash2 className="size-4" />
                                          </Button>
                                        )}
                                    </div>
                                    {variantErrors[opt.id] && (
                                      <p className="text-xs text-red-500">
                                        {variantErrors[opt.id]}
                                      </p>
                                    )}
                                  </div>
                                ))}
                                <div className="flex items-center justify-between">
                                  <Button
                                    className="px-3 py-0.5 text-xs h-7 text-red-500 hover:text-red-600 hover:bg-red-100 shadow-none border-red-300"
                                    variant={"outline"}
                                    onClick={() => handleRemoveVariant(idx)}
                                  >
                                    Delete
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleActiveVariant(idx, false)
                                    }
                                    className="px-3 py-0.5 text-xs h-7"
                                  >
                                    Done
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant={"ghost"}
                            className={cn(
                              "p-5 h-auto justify-between group w-full rounded-none",
                              variants.length > 1 && "border-b border-gray-300"
                            )}
                            onClick={() => handleActiveVariant(idx, true)}
                          >
                            <div className="flex flex-col gap-3">
                              <Input
                                value={item.name}
                                className="border-none shadow-none disabled:opacity-100 px-0 h-7 font-semibold"
                                disabled
                              />
                              <div className="flex flex-wrap items-center gap-2">
                                {item.option
                                  .slice(0, item.option.length - 1)
                                  .map((o) => (
                                    <p
                                      key={o.id}
                                      className="text-xs py-0.5 font-medium px-2 bg-gray-300 rounded-md"
                                    >
                                      {o.value}
                                    </p>
                                  ))}
                              </div>
                            </div>
                            <div className="mr-5 group-hover:block hidden text-gray-400">
                              <Edit3 />
                            </div>
                          </Button>
                        )}
                      </Fragment>
                    ))}
                  </div>
                  <Button
                    className={cn(
                      "text-xs justify-start",
                      variants.length > 0 && "rounded-t-none"
                    )}
                    onClick={() =>
                      setVariants((prev) => [
                        ...prev,
                        {
                          id: generateRandomNumber(3),
                          name: "",
                          option: [{ id: generateRandomNumber(3), value: "" }],
                          isActive: true,
                        },
                      ])
                    }
                  >
                    <PlusCircle className="size-3.5" />
                    Add Option
                  </Button>
                </div>
              </div>
              <div className="bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col px-3 py-5 gap-5">
                <h5 className="font-bold underline underline-offset-4 text-sm">
                  Inventory
                </h5>
                <div className="flex flex-col gap-3">
                  {combo.map((item, idx) => (
                    <div
                      key={`${Object.values(item.items).map((i) => i)}-${idx}`}
                      className="flex flex-col border rounded-md overflow-hidden"
                    >
                      <div className="flex items-center gap-3 text-sm px-5 py-3 bg-gray-100">
                        <Tag className="size-3" />
                        <p>
                          {Object.values(item.items)
                            .map((i) => i)
                            .join(" / ")}
                        </p>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-3 text-sm flex-col px-5 py-3">
                        <div className="flex items-center gap-3 w-full">
                          <LabelInput
                            label="SKU"
                            classLabel="text-xs"
                            id="sku"
                            value={item.sku}
                            onChange={(e) => handleChangeVariantCombo(idx, e)}
                          />
                          <LabelInput label="Barcode" classLabel="text-xs" />
                          <LabelInput
                            label="Stock"
                            type="number"
                            classContainer="w-20 flex-none"
                          />
                        </div>
                        <div className="flex items-center gap-3 w-full">
                          <LabelInput
                            label="Price"
                            type="number"
                            classLabel="text-xs"
                          />
                          <LabelInput
                            label="Compare-at price"
                            type="number"
                            classLabel="text-xs"
                          />
                          <div className="flex flex-col gap-1.5 w-20 flex-none">
                            <Label>Weight</Label>
                            <div className="flex items-center relative">
                              <Input
                                className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none pr-6"
                                type="number"
                              />
                              <TooltipText value="Unit gram" side="right">
                                <InfoIcon className="size-3 absolute right-2 text-gray-500" />
                              </TooltipText>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-col border rounded-md overflow-hidden">
                    <div className="flex items-center gap-3 text-sm px-5 py-3 bg-gray-100">
                      <Tag className="size-3" />
                      <p>lsds / dsds</p>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3 text-sm flex-col px-5 py-3">
                      <div className="flex items-center gap-3 w-full">
                        <LabelInput label="SKU" classLabel="text-xs" />
                        <LabelInput label="Barcode" classLabel="text-xs" />
                        <LabelInput
                          label="Stock"
                          type="number"
                          classContainer="w-20 flex-none"
                        />
                      </div>
                      <div className="flex items-center gap-3 w-full">
                        <LabelInput
                          label="Price"
                          type="number"
                          classLabel="text-xs"
                        />
                        <LabelInput
                          label="Compare-at price"
                          type="number"
                          classLabel="text-xs"
                        />
                        <div className="flex flex-col gap-1.5 w-20 flex-none">
                          <Label>Weight</Label>
                          <div className="flex items-center relative">
                            <Input
                              className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none pr-6"
                              type="number"
                            />
                            <TooltipText value="Unit gram" side="right">
                              <InfoIcon className="size-3 absolute right-2 text-gray-500" />
                            </TooltipText>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col">
              <div className="px-3 py-5 flex flex-col gap-5">
                <h5 className="font-bold underline underline-offset-4 text-sm">
                  Inventory
                </h5>
                <div className="flex items-center gap-3">
                  <LabelInput label="SKU" />
                  <LabelInput label="Barcode" />
                </div>
              </div>
              <Separator />
              <div className="px-3 py-5 flex flex-col gap-5">
                <h5 className="font-bold underline underline-offset-4 text-sm">
                  Pricing
                </h5>
                <div className="flex items-center gap-3">
                  <LabelInput label="Price" type="number" />
                  <LabelInput label="Compare-at price" type="number" />
                </div>
              </div>
              <Separator />
              <div className="px-3 py-5 flex flex-col gap-5">
                <h5 className="font-bold underline underline-offset-4 text-sm">
                  Shipping
                </h5>
                <div className="flex flex-col gap-1.5 w-full">
                  <Label>Weight</Label>
                  <div className="flex items-center relative">
                    <Input className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none" />
                    <p className="absolute right-3 text-xs py-0.5 font-medium px-2 bg-gray-300 rounded-md">
                      Gram
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-span-1 w-full relative">
          <div className="flex flex-col gap-3 sticky top-3">
            <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5 w-full">
                <Label>Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger className="bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 w-full">
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent
                    className="min-w-[var(--radix-popover-trigger-width)] p-0"
                    align="end"
                  >
                    <SelectGroup>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5 w-full">
                <Label>Category</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="w-full justify-between bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 group"
                      variant={"outline"}
                    >
                      <span className="font-normal text-gray-500">
                        Choose a category
                      </span>
                      <ChevronDown className="text-gray-500 group-data-[state=open]:rotate-180 transition-all" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="min-w-[var(--radix-popover-trigger-width)] p-0"
                    align="end"
                  >
                    <Command>
                      <CommandInput />
                      <CommandList>
                        <CommandEmpty />
                        <CommandGroup>
                          <CommandItem>Categori 1</CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <Label>Supplier</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="w-full justify-between bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 group"
                      variant={"outline"}
                    >
                      <span className="font-normal text-gray-500">
                        Choose a supplier
                      </span>
                      <ChevronDown className="text-gray-500 group-data-[state=open]:rotate-180 transition-all" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="min-w-[var(--radix-popover-trigger-width)] p-0"
                    align="end"
                  >
                    <Command>
                      <CommandInput />
                      <CommandList>
                        <CommandEmpty />
                        <CommandGroup>
                          <CommandItem>Categori 1</CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <Label>Pets</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="w-full justify-between bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 group"
                      variant={"outline"}
                    >
                      <span className="font-normal text-gray-500">
                        Choose a Pets
                      </span>
                      <ChevronDown className="text-gray-500 group-data-[state=open]:rotate-180 transition-all" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="min-w-[var(--radix-popover-trigger-width)] p-0"
                    align="end"
                  >
                    <Command>
                      <CommandInput />
                      <CommandList>
                        <CommandEmpty />
                        <CommandGroup>
                          <CommandItem>Categori 1</CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
