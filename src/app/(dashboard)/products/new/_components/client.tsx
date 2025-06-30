"use client";

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
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Save } from "lucide-react";
import React, { MouseEvent, useMemo, useState } from "react";
import {
  useCreateProduct,
  useGetSelectCategories,
  useGetSelectPets,
  useGetSelectSuppliers,
} from "../_api";
import { ProductCore } from "./product-core";
import { ProductDescription } from "./product-description";
import { SingleVariant } from "./single-variant";
import { MultipleVariant } from "./multiple-variant";

export const Client = () => {
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

  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();

  const { data: categoriesSelect, isPending: isPendingCategories } =
    useGetSelectCategories();
  const { data: suppliersSelect, isPending: isPendingSuppliers } =
    useGetSelectSuppliers();
  const { data: petsSelect, isPending: isPendingPets } = useGetSelectPets();

  const loadingSelect =
    isPendingCategories || isPendingSuppliers || isPendingPets || isCreating;

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

  const handleSubmit = async (e: MouseEvent) => {
    e.preventDefault();
    const body = new FormData();

    body.set("title", input.title);
    if (input.image) body.set("image", input.image);
    body.set("description", input.description);
    body.set("indication", input.indication);
    body.set("dosageUsage", input.dosageUsage);
    body.set("storageInstruction", input.storageInstruction);
    body.set("packaging", input.packaging);
    body.set("registrationNumber", input.registrationNumber);
    body.set("isActive", input.isActive.toString());
    body.set("categoryId", input.categoryId);
    body.set("supplierId", input.supplierId);
    body.set("petId", input.petId);

    body.set("compositions", JSON.stringify(compositions));

    body.set("variants", JSON.stringify(variants));
    body.set("defaultVariant", JSON.stringify(defaultVariants));

    createProduct({ body });
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-20">
      <div className="w-full flex items-center gap-4">
        <h1 className="text-xl font-semibold">Add Products</h1>
      </div>
      <div className="w-full grid grid-cols-3 gap-6">
        <div className="col-span-2 w-full flex flex-col gap-4">
          <ProductCore
            input={input}
            handleOnChange={handleOnChange}
            disabled={isCreating}
          />
          <ProductDescription
            input={input}
            handleOnChange={handleOnChange}
            compositions={compositions}
            setCompositions={setCompositions}
            disabled={isCreating}
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
            />
          ) : (
            <SingleVariant
              defaultVariants={defaultVariants}
              setDefaultVariants={setDefaultVariants}
              disabled={isCreating}
            />
          )}
        </div>
        <div className="col-span-1 w-full relative">
          <div className="flex flex-col gap-3 sticky top-3">
            <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5 w-full">
                <Label>Category</Label>
                <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      className="w-full justify-between bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 group overflow-hidden"
                      variant={"outline"}
                      disabled={isCreating || loadingSelect}
                    >
                      {input.categoryId ? (
                        <span className="font-normal w-full truncate text-left">
                          {
                            categoriesList.find(
                              (category) => category.id === input.categoryId
                            )?.name
                          }
                        </span>
                      ) : (
                        <span className="font-normal text-gray-500 text-xs">
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
                              <Check
                                className={cn(
                                  "hidden ml-auto",
                                  category.id === input.categoryId && "flex"
                                )}
                              />
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
                      disabled={isCreating || loadingSelect}
                    >
                      {input.supplierId ? (
                        <span className="font-normal w-full truncate text-left">
                          {
                            suppliersList.find(
                              (supplier) => supplier.id === input.supplierId
                            )?.name
                          }
                        </span>
                      ) : (
                        <span className="font-normal text-gray-500 text-xs">
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
                              <Check
                                className={cn(
                                  "hidden ml-auto",
                                  supplier.id === input.supplierId && "flex"
                                )}
                              />
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
                      disabled={isCreating || loadingSelect}
                    >
                      {input.petId ? (
                        <span className="font-normal w-full truncate text-left">
                          {petsList.find((pet) => pet.id === input.petId)?.name}
                        </span>
                      ) : (
                        <span className="font-normal text-gray-500 text-xs">
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
                              <Check
                                className={cn(
                                  "hidden ml-auto",
                                  pet.id === input.petId && "flex"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
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
