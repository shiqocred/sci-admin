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
import {
  ChevronDown,
  Edit3,
  Plus,
  PlusCircle,
  Tag,
  Trash2,
} from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import {
  useGetSelectCategories,
  useGetSelectPets,
  useGetSelectSuppliers,
} from "../_api";

export const Client = () => {
  const inputCompositionRef = useRef<HTMLInputElement | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [isPetOpen, setIsPetOpen] = useState(false);
  const [isVariant, setIsVariant] = useState<boolean | "indeterminate">(false);
  const [input, setInput] = useState({
    title: "",
    image: null as File | null,
    description: "",
    indication: "",
    dosageUsage: "",
    storageInstruction: "",
    packaging: "",
    registrationNumber: "",
    isActive: false,
    categoryId: "",
    supplierId: "",
    petId: "",
  });
  const [compositionItem, setCompositionItem] = useState({
    name: "",
    value: "",
  });
  const [compositions, setCompositions] = useState<
    { id: string; name: string; value: string }[]
  >([]);
  const [defaultVariants, setDefaultVariants] = useState({
    id: "",
    name: "default",
    sku: "",
    barcode: "",
    quantity: "0",
    salePrice: "0",
    compareAtPrice: "0",
    weight: "0",
  });
  const [variantItem, setVariantItem] = useState({
    name: "",
    sku: "",
    barcode: "",
    quantity: "0",
    salePrice: "0",
    compareAtPrice: "0",
    weight: "0",
    isOpen: true,
  });
  const [variants, setVariants] = useState<
    {
      id: string;
      name: string;
      sku: string;
      barcode: string;
      quantity: string;
      salePrice: string;
      compareAtPrice: string;
      weight: string;
      isOpen: boolean;
    }[]
  >([]);

  const { data: categoriesSelect, isPending: isPendingCategories } =
    useGetSelectCategories();
  const { data: suppliersSelect, isPending: isPendingSuppliers } =
    useGetSelectSuppliers();
  const { data: petsSelect, isPending: isPendingPets } = useGetSelectPets();

  const categoriesList = useMemo(() => {
    return categoriesSelect?.data ?? [];
  }, [categoriesSelect]);
  const suppliersList = useMemo(() => {
    return suppliersSelect?.data ?? [];
  }, [suppliersSelect]);
  const petsList = useMemo(() => {
    return petsSelect?.data ?? [];
  }, [petsSelect]);

  const handleOnChange = (id: string, value: string) => {
    setInput((prev) => ({ ...prev, [id]: value }));
  };

  const handleChangeVariant = (
    id: string,
    field: keyof (typeof variants)[number],
    value: string | boolean
  ) => {
    setVariants((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-20">
      <div className="w-full flex items-center gap-4">
        <h1 className="text-xl font-semibold">Add Products</h1>
      </div>
      <div className="w-full grid grid-cols-3 gap-6">
        <div className="col-span-2 w-full flex flex-col gap-4">
          <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
            <LabelInput
              label="Title"
              placeholder="e.g. Obat Kutu Kucing"
              id="title"
              value={input.title}
              onChange={(e) => handleOnChange(e.target.id, e.target.value)}
            />
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
              <Textarea
                placeholder="e.g. FOURCIDE EMV is a combination..."
                className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none min-h-24 placeholder:text-xs"
                id="description"
                value={input.description}
                onChange={(e) => handleOnChange(e.target.id, e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <Label>Indication</Label>
              <RichInput
                content={input.indication}
                onChange={(e) => handleOnChange("indication", e)}
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <Label>Dosage & Usage</Label>
              <RichInput
                content={input.dosageUsage}
                onChange={(e) => handleOnChange("dosageUsage", e)}
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <Label>Storage Instruction</Label>
              <Textarea
                placeholder="e.g. Stored at 23°C to 27°C..."
                className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none min-h-24 placeholder:text-xs"
                id="storageInstruction"
                value={input.storageInstruction}
                onChange={(e) => handleOnChange(e.target.id, e.target.value)}
              />
            </div>
            <LabelInput
              label="Packaging"
              id="packaging"
              placeholder="e.g. 1L and 5L"
              value={input.packaging}
              onChange={(e) => handleOnChange(e.target.id, e.target.value)}
            />
            <LabelInput
              label="Registration number"
              id="registrationNumber"
              placeholder="e.g. KEMENTAN RI No..."
              value={input.registrationNumber}
              onChange={(e) => handleOnChange(e.target.id, e.target.value)}
            />
            <div className="flex flex-col gap-1.5 w-full">
              <Label>Composition</Label>
              <div className="border p-3 flex flex-col w-full rounded-md gap-2">
                <div className="flex items-center gap-2 border-b pb-1">
                  <div className="w-full">
                    <Label className="text-xs text-gray-500">Name</Label>
                  </div>
                  <div className="w-full">
                    <Label className="text-xs text-gray-500">Value</Label>
                  </div>
                  <div className="w-9 flex-none" />
                </div>
                {compositions.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Input
                      className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none disabled:opacity-100"
                      value={item.name}
                      disabled
                    />
                    <Input
                      className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none disabled:opacity-100"
                      value={item.value}
                      disabled
                    />
                    <Button
                      className="hover:bg-red-100 hover:text-red-500"
                      variant={"ghost"}
                      size={"icon"}
                      onClick={() =>
                        setCompositions((prev) =>
                          prev.filter((c) => c.id !== item.id)
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setCompositions((prev) => [
                      ...prev,
                      { id: generateRandomNumber(3), ...compositionItem },
                    ]);
                    setCompositionItem({ name: "", value: "" });
                    if (inputCompositionRef.current) {
                      inputCompositionRef.current.focus();
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    ref={inputCompositionRef}
                    placeholder="e.g. Vitamin A"
                    className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none placeholder:text-xs"
                    value={compositionItem.name}
                    onChange={(e) =>
                      setCompositionItem((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="e.g. 1000 IU"
                    className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none placeholder:text-xs"
                    value={compositionItem.value}
                    onChange={(e) =>
                      setCompositionItem((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                  />
                  <Button
                    className="hover:bg-gray-200"
                    variant={"ghost"}
                    size={"icon"}
                    type="submit"
                  >
                    <Plus />
                  </Button>
                </form>
              </div>
            </div>
          </div>
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
            <div className="bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col px-5 py-3 gap-5">
              <h5 className="font-bold underline underline-offset-4 text-sm">
                Variants
              </h5>
              <div className="border rounded-md overflow-hidden">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setVariants((prev) => [
                      ...prev,
                      { id: generateRandomNumber(3), ...variantItem },
                    ]);
                    setVariantItem((prev) => ({ ...prev, name: "" }));
                  }}
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
                  />
                  <Button type="submit">
                    <PlusCircle className="size-3.5" />
                    <p className="text-xs">Add Variant</p>
                  </Button>
                </form>
                {variants.map((variant, idx) =>
                  variant.isOpen ? (
                    <div
                      key={variant.id}
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
                                handleChangeVariant(
                                  variant.id,
                                  "name",
                                  e.target.value
                                )
                              }
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
                                handleChangeVariant(
                                  variant.id,
                                  "sku",
                                  e.target.value
                                )
                              }
                            />
                            <LabelInput
                              label="Barcode"
                              placeholder="e.g. r93edi067"
                              value={variant.barcode}
                              onChange={(e) =>
                                handleChangeVariant(
                                  variant.id,
                                  "barcode",
                                  e.target.value
                                )
                              }
                            />
                            <LabelInput
                              label="Stock"
                              placeholder="e.g. 1000"
                              classContainer="w-32 flex-none"
                              value={variant.quantity}
                              onChange={(e) =>
                                handleChangeVariant(
                                  variant.id,
                                  "quantity",
                                  e.target.value
                                )
                              }
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
                                handleChangeVariant(
                                  variant.id,
                                  "salePrice",
                                  e.target.value
                                )
                              }
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
                                  handleChangeVariant(
                                    variant.id,
                                    "weight",
                                    e.target.value
                                  )
                                }
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
                          onClick={() =>
                            setVariants((prev) =>
                              prev.filter((item) => item.id !== variant.id)
                            )
                          }
                        >
                          Delete
                        </Button>
                        <Button
                          onClick={() =>
                            setVariants((prev) =>
                              prev.map((item) =>
                                item.id === variant.id
                                  ? { ...item, isOpen: false }
                                  : item
                              )
                            )
                          }
                          className="px-3 py-0.5 text-xs h-7"
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      key={variant.id}
                      className={cn(
                        "h-auto px-3 py-3 w-full rounded-none justify-between group",
                        idx !== variants.length - 1 && "border-b"
                      )}
                      variant={"ghost"}
                      onClick={() =>
                        setVariants((prev) =>
                          prev.map((item) =>
                            item.id === variant.id
                              ? { ...item, isOpen: true }
                              : item
                          )
                        )
                      }
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
          ) : (
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
                    onChange={(e) =>
                      setDefaultVariants((prev) => ({
                        ...prev,
                        [e.target.id]: e.target.value,
                      }))
                    }
                  />
                  <LabelInput
                    label="Barcode"
                    placeholder="e.g. r93edi067"
                    value={defaultVariants.barcode}
                    id="barcode"
                    onChange={(e) =>
                      setDefaultVariants((prev) => ({
                        ...prev,
                        [e.target.id]: e.target.value,
                      }))
                    }
                  />
                  <LabelInput
                    label="Stock"
                    placeholder="e.g. 1000"
                    value={defaultVariants.quantity}
                    classContainer="w-32 flex-none"
                    id="quantity"
                    onChange={(e) =>
                      setDefaultVariants((prev) => ({
                        ...prev,
                        [e.target.id]: e.target.value,
                      }))
                    }
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
                    value={defaultVariants.salePrice}
                    id="salePrice"
                    onChange={(e) =>
                      setDefaultVariants((prev) => ({
                        ...prev,
                        [e.target.id]: e.target.value,
                      }))
                    }
                  />
                  <LabelInput
                    label="Compare-at price"
                    type="number"
                    placeholder="e.g. 10000"
                    value={defaultVariants.compareAtPrice}
                    id="compareAtPrice"
                    onChange={(e) =>
                      setDefaultVariants((prev) => ({
                        ...prev,
                        [e.target.id]: e.target.value,
                      }))
                    }
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
                      onChange={(e) =>
                        setDefaultVariants((prev) => ({
                          ...prev,
                          [e.target.id]: e.target.value,
                        }))
                      }
                    />
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
                <Select
                  value={input.isActive ? "active" : "draft"}
                  onValueChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      isActive: e === "active",
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
                <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      className="w-full justify-between bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 group"
                      variant={"outline"}
                    >
                      {input.categoryId ? (
                        <span className="font-normal">
                          {
                            categoriesList.find(
                              (category) => category.id === input.categoryId
                            )?.name
                          }
                        </span>
                      ) : (
                        <span className="font-normal text-gray-500">
                          Choose a category
                        </span>
                      )}
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
                          {categoriesList.map((category) => (
                            <CommandItem
                              onSelect={(e) => {
                                setInput((prev) => ({
                                  ...prev,
                                  categoryId: e,
                                }));
                                setIsCategoryOpen(false);
                              }}
                              value={category.id}
                              key={category.id}
                            >
                              {category.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <Label>Supplier</Label>
                <Popover open={isSupplierOpen} onOpenChange={setIsSupplierOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      className="w-full justify-between bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 group"
                      variant={"outline"}
                    >
                      {input.supplierId ? (
                        <span className="font-normal">
                          {
                            suppliersList.find(
                              (supplier) => supplier.id === input.supplierId
                            )?.name
                          }
                        </span>
                      ) : (
                        <span className="font-normal text-gray-500">
                          Choose a supplier
                        </span>
                      )}
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
                          {suppliersList.map((supplier) => (
                            <CommandItem
                              onSelect={(e) => {
                                setInput((prev) => ({
                                  ...prev,
                                  supplierId: e,
                                }));
                                setIsSupplierOpen(false);
                              }}
                              value={supplier.id}
                              key={supplier.id}
                            >
                              {supplier.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <Label>Pet</Label>
                <Popover open={isPetOpen} onOpenChange={setIsPetOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      className="w-full justify-between bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 group"
                      variant={"outline"}
                    >
                      {input.petId ? (
                        <span className="font-normal">
                          {petsList.find((pet) => pet.id === input.petId)?.name}
                        </span>
                      ) : (
                        <span className="font-normal text-gray-500">
                          Choose a pet
                        </span>
                      )}
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
                          {petsList.map((pet) => (
                            <CommandItem
                              onSelect={(e) => {
                                setInput((prev) => ({
                                  ...prev,
                                  petId: e,
                                }));
                                setIsPetOpen(false);
                              }}
                              value={pet.id}
                              key={pet.id}
                            >
                              {pet.name}
                            </CommandItem>
                          ))}
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
