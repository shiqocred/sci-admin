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
import {
  ChartNoAxesGantt,
  Check,
  ChevronDown,
  ChevronRight,
  CirclePlus,
  Eye,
  RefreshCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import React, { MouseEvent, useEffect, useMemo, useState } from "react";
import {
  useUpdateProduct,
  useGetSelectCategories,
  useGetSelectPets,
  useGetSelectSuppliers,
} from "../_api";
import { ProductCore } from "./product-core";
import { ProductDescription } from "./product-description";
import { SingleVariant } from "./single-variant";
import { MultipleVariant } from "./multiple-variant";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteProduct } from "../../../_api";
import { useGetShowProduct } from "../../_api";
import { TooltipText } from "@/providers/tooltip-provider";

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
  const { productId } = useParams();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [isPetOpen, setIsPetOpen] = useState(false);
  const [isVariant, setIsVariant] = useState<boolean | "indeterminate">(false);
  const [imagesProduct, setImagesProduct] = useState<File[] | null>(null);
  const [imageOld, setImageOld] = useState<string[]>([]);
  const [input, setInput] = useState(initialValue);
  const [petIds, setPetIds] = useState<string[]>([]);
  const [compositions, setCompositions] = useState<CompositionProps[]>([]);
  const [defaultVariants, setDefaultVariants] = useState(initialDefaultVariant);
  const [variants, setVariants] = useState<VariantsProps[]>([]);

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Product",
    "This action cannot be undone",
    "destructive"
  );

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  const { data: categoriesSelect, isPending: isPendingCategories } =
    useGetSelectCategories();
  const { data: suppliersSelect, isPending: isPendingSuppliers } =
    useGetSelectSuppliers();
  const { data: petsSelect, isPending: isPendingPets } = useGetSelectPets();

  const { data, refetch, isRefetching } = useGetShowProduct({
    productId: productId as string,
  });

  useEffect(() => {
    const product = data?.data;

    setInput({
      title: product?.title ?? "",
      description: product?.description ?? "",
      indication: product?.indication ?? "",
      dosageUsage: product?.dosageUsage ?? "",
      storageInstruction: product?.storageInstruction ?? "",
      packaging: product?.packaging ?? "",
      registrationNumber: product?.registrationNumber ?? "",
      isActive: product ? product.status : false,
      categoryId: product?.category.id ?? "",
      supplierId: product?.supplier.id ?? "",
    });

    if (product && product?.variants.length > 0) {
      if (product?.variants[0].isDefault) {
        const dataDefaultVariant = product?.variants[0];
        setDefaultVariants({
          id: dataDefaultVariant.id,
          name: "default",
          sku: dataDefaultVariant.sku,
          barcode: dataDefaultVariant.barcode,
          quantity: dataDefaultVariant.stock,
          normalPrice: dataDefaultVariant.normalPrice,
          basicPrice: dataDefaultVariant.basicPrice,
          petShopPrice: dataDefaultVariant.petShopPrice,
          doctorPrice: dataDefaultVariant.doctorPrice,
          weight: dataDefaultVariant.weight,
        });
      } else {
        const dataVariant = product?.variants;
        setIsVariant(true);
        setVariants(
          (dataVariant ?? []).map((item) => ({
            ...item,
            quantity: item.stock,
            isOpen: false,
          }))
        );
      }
    }
    setCompositions(product?.compositions ?? []);
    setPetIds((product?.pets ?? []).map((item) => item.id));
    setImageOld(product?.images ?? []);
  }, [data]);

  const loadingSelect =
    isPendingCategories ||
    isPendingSuppliers ||
    isPendingPets ||
    isUpdating ||
    isDeleting;

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

    body.append("title", input.title);
    imageOld?.forEach((img) => body.append("imageOld", img)); // <-- gunakan append!
    imagesProduct?.forEach((img) => body.append("image", img)); // <-- gunakan append!

    body.append("description", input.description);
    body.append("indication", input.indication);
    body.append("dosageUsage", input.dosageUsage);
    body.append("storageInstruction", input.storageInstruction);
    body.append("packaging", input.packaging);
    body.append("registrationNumber", input.registrationNumber);
    body.append("isActive", input.isActive.toString());
    body.append("categoryId", input.categoryId);
    body.append("supplierId", input.supplierId);

    // Pet many-to-many
    body.append("petId", JSON.stringify(petIds)); // <-- kirim sebagai array string

    body.append("compositions", JSON.stringify(compositions));
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

    updateProduct({ body, params: { productId: productId as string } });
  };

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteProduct({ params: { id: productId as string } });
  };

  const handleRemovePet = (i: any) => {
    setPetIds((v) => v.filter((z) => z !== i));
  };

  const handleChangePet = (id: any) => {
    setPetIds(
      (prev) =>
        prev.includes(id)
          ? prev.filter((pid) => pid !== id) // jika sudah ada, hapus
          : [...prev, id] // jika belum ada, tambahkan
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-20">
      <DeleteDialog />
      <div className="flex justify-between gap-4 items-center">
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
          <h1 className="text-xl font-semibold">Edit Products</h1>
        </div>
        <div className="flex items-center gap-3">
          <TooltipText value="Reload data">
            <Button
              size={"icon"}
              variant={"secondary"}
              className="size-7 hover:bg-gray-200 hover:cursor-pointer"
              onClick={() => refetch()}
            >
              <RefreshCcw
                className={cn("size-4", isRefetching && "animate-spin")}
              />
            </Button>
          </TooltipText>
          <TooltipText value="Detail">
            <Button
              size={"icon"}
              variant={"secondary"}
              className="size-7 hover:bg-yellow-200"
              asChild
            >
              <Link href={`/products/${productId}/detail`}>
                <Eye className="size-4" />
              </Link>
            </Button>
          </TooltipText>
          <TooltipText value="Delete">
            <Button
              size={"icon"}
              variant={"secondary"}
              className="size-7 hover:bg-red-200 hover:cursor-pointer"
              onClick={handleDelete}
            >
              <Trash2 className="size-4" />
            </Button>
          </TooltipText>
        </div>
      </div>
      <div className="w-full grid grid-cols-3 gap-6">
        <div className="col-span-2 w-full flex flex-col gap-4">
          <ProductCore
            input={input}
            handleOnChange={handleOnChange}
            disabled={isUpdating}
            setImagesProduct={setImagesProduct}
            imageOld={imageOld}
            setImageOld={setImageOld}
          />
          <ProductDescription
            input={input}
            handleOnChange={handleOnChange}
            compositions={compositions}
            setCompositions={setCompositions}
            disabled={isUpdating}
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
              disabled={isUpdating}
            />
          ) : (
            <SingleVariant
              defaultVariants={defaultVariants}
              setDefaultVariants={setDefaultVariants}
              disabled={isUpdating}
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
                      disabled={isUpdating || loadingSelect}
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
                      disabled={isUpdating || loadingSelect}
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
                <div
                  className={cn(
                    "flex flex-col gap-3",
                    petIds.length > 0 && "border rounded-md p-3 "
                  )}
                >
                  <div className="flex flex-wrap gap-3">
                    {petIds.map((i) => (
                      <div
                        className="text-xs px-3 py-0.5 bg-gray-300 w-fit rounded relative flex items-center group"
                        key={i}
                      >
                        {petsList.find((v) => v.id === i)?.name}
                        <div className="group-hover:flex hidden items-center w-full absolute right-0">
                          <div className="w-full bg-gradient-to-r from-gray-300/50 to-gray-300 h-5" />
                          <button
                            className="px-2 flex-none bg-gray-300 h-full"
                            onClick={() => handleRemovePet(i)}
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Popover open={isPetOpen} onOpenChange={setIsPetOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        className="w-full bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 text-xs group"
                        variant={"outline"}
                        disabled={isUpdating || loadingSelect}
                      >
                        <CirclePlus className="size-3.5" />
                        Add Pets
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
                                onSelect={(id) => {
                                  handleChangePet(id);
                                }}
                                value={pet.id}
                                key={pet.id}
                              >
                                {pet.name}
                                <Check
                                  className={cn(
                                    "hidden ml-auto",
                                    petIds.includes(pet.id) && "flex"
                                    // pet.id === input.petId && "flex"
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
            </div>
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
                Update
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
