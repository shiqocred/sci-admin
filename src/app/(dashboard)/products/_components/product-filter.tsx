import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, PlusCircle, XCircle } from "lucide-react";
import React, { useMemo, useState } from "react";

export const ProductFilter = ({
  data,
  categoryId,
  supplierId,
  petId,
  statusProduct,
  setQuery,
  disabled,
}: {
  data: any;
  categoryId: string[] | null;
  supplierId: string[] | null;
  petId: string[] | null;
  statusProduct: string;
  setQuery: any;
  disabled?: boolean;
}) => {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [isPetOpen, setIsPetOpen] = useState(false);

  const categoriesList = useMemo(() => {
    return data?.data.selectOptions.categories ?? [];
  }, [data]);
  const suppliersList = useMemo(() => {
    return data?.data.selectOptions.suppliers ?? [];
  }, [data]);
  const petsList = useMemo(() => {
    return data?.data.selectOptions.pets ?? [];
  }, [data]);
  return (
    <div className="flex items-center gap-2">
      <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <div className="flex items-center border border-dashed rounded-md h-8 hover:bg-gray-100 transition cursor-default">
            <Button
              variant={"ghost"}
              className="text-xs font-medium h-full py-0 px-3 hover:bg-transparent"
            >
              <PlusCircle className="size-3" />
              Status
            </Button>
            {statusProduct && (
              <>
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-full"
                />
                <div
                  className={cn(
                    "text-xs font-medium rounded-sm mx-2 px-2 py-0.5 capitalize flex items-center justify-center",
                    statusProduct === "publish" ? "bg-green-200" : "bg-gray-200"
                  )}
                >
                  {statusProduct}
                </div>
              </>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-32" align="start">
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  value="publish"
                  className="text-xs"
                  onSelect={(e) => {
                    setQuery({ statusProduct: e });
                    setIsStatusOpen(false);
                  }}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      statusProduct === "publish"
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="text-primary-foreground size-3" />
                  </div>
                  Publish
                </CommandItem>
                <CommandItem
                  value="draft"
                  className="text-xs"
                  onSelect={(e) => {
                    setQuery({ statusProduct: e });
                    setIsStatusOpen(false);
                  }}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      statusProduct === "draft"
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="text-primary-foreground size-3" />
                  </div>
                  Draft
                </CommandItem>
              </CommandGroup>
              {statusProduct && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      className="text-xs font-medium justify-center"
                      onSelect={() => {
                        setQuery({ statusProduct: null });
                        setIsStatusOpen(false);
                      }}
                    >
                      Clear filters
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <div className="flex items-center border border-dashed rounded-md h-8 hover:bg-gray-100 transition cursor-default">
            <Button
              variant={"ghost"}
              className="text-xs font-medium h-full py-0 px-3 hover:bg-transparent"
            >
              <PlusCircle className="size-3" />
              Categories
            </Button>
            {categoryId && categoryId.length > 0 && (
              <>
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-full"
                />
                <div className="size-5 text-xs bg-gray-200 font-medium rounded-sm mx-2 flex items-center justify-center">
                  {categoryId.length.toLocaleString()}
                </div>
              </>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-fit" align="start">
          <Command>
            <CommandInput
              placeholder="Category"
              className="placeholder:text-xs"
            />
            <CommandList>
              <CommandEmpty className="text-xs">
                Category not found
              </CommandEmpty>
              <CommandGroup>
                {categoriesList.map((item: any) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    className="text-xs"
                    onSelect={(e) => {
                      if (categoryId?.includes(item.id)) {
                        setQuery({
                          categoryId: categoryId.filter((c) => c !== item.id),
                        });
                      } else {
                        setQuery({
                          categoryId: [...(categoryId ?? []), e],
                        });
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        categoryId?.includes(item.id)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="text-primary-foreground size-3" />
                    </div>
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              {categoryId && categoryId.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      className="text-xs font-medium justify-center"
                      onSelect={() => {
                        setQuery({ categoryId: null });
                        setIsCategoryOpen(false);
                      }}
                    >
                      Clear filters
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Popover open={isSupplierOpen} onOpenChange={setIsSupplierOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <div className="flex items-center border border-dashed rounded-md h-8 hover:bg-gray-100 transition cursor-default">
            <Button
              variant={"ghost"}
              className="text-xs font-medium h-full py-0 px-3 hover:bg-transparent"
            >
              <PlusCircle className="size-3" />
              Suppliers
            </Button>
            {supplierId && supplierId.length > 0 && (
              <>
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-full"
                />
                <div className="size-5 text-xs bg-gray-200 font-medium rounded-sm mx-2 flex items-center justify-center">
                  {supplierId.length.toLocaleString()}
                </div>
              </>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-fit" align="start">
          <Command>
            <CommandInput
              placeholder="Supplier"
              className="placeholder:text-xs"
            />
            <CommandList>
              <CommandEmpty className="text-xs">
                Supplier not found
              </CommandEmpty>
              <CommandGroup>
                {suppliersList.map((item: any) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    className="text-xs"
                    onSelect={(e) => {
                      if (supplierId?.includes(item.id)) {
                        setQuery({
                          supplierId: supplierId.filter((c) => c !== item.id),
                        });
                      } else {
                        setQuery({
                          supplierId: [...(supplierId ?? []), e],
                        });
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        supplierId?.includes(item.id)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="text-primary-foreground size-3" />
                    </div>
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              {supplierId && supplierId.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      className="text-xs font-medium justify-center"
                      onSelect={() => {
                        setQuery({ supplierId: null });
                        setIsCategoryOpen(false);
                      }}
                    >
                      Clear filters
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Popover open={isPetOpen} onOpenChange={setIsPetOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <div className="flex items-center border border-dashed rounded-md h-8 hover:bg-gray-100 transition cursor-default">
            <Button
              variant={"ghost"}
              className="text-xs font-medium h-full py-0 px-3 hover:bg-transparent"
            >
              <PlusCircle className="size-3" />
              Pets
            </Button>
            {petId && petId.length > 0 && (
              <>
                <Separator
                  orientation="vertical"
                  className="data-[orientation=vertical]:h-full"
                />
                <div className="size-5 text-xs bg-gray-200 font-medium rounded-sm mx-2 flex items-center justify-center">
                  {petId.length.toLocaleString()}
                </div>
              </>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-fit" align="start">
          <Command>
            <CommandInput placeholder="Pet" className="placeholder:text-xs" />
            <CommandList>
              <CommandEmpty className="text-xs">Pet not found</CommandEmpty>
              <CommandGroup>
                {petsList.map((item: any) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    className="text-xs"
                    onSelect={(e) => {
                      if (petId?.includes(item.id)) {
                        setQuery({
                          petId: petId.filter((c) => c !== item.id),
                        });
                      } else {
                        setQuery({
                          petId: [...(petId ?? []), e],
                        });
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        petId?.includes(item.id)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="text-primary-foreground size-3" />
                    </div>
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              {petId && petId.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      className="text-xs font-medium justify-center"
                      onSelect={() => {
                        setQuery({ petId: null });
                        setIsCategoryOpen(false);
                      }}
                    >
                      Clear filters
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {(statusProduct ||
        (categoryId && categoryId.length > 0) ||
        (supplierId && supplierId.length > 0) ||
        (petId && petId.length > 0)) && (
        <Button
          className="text-xs font-normal h-8 py-0 px-3"
          variant={"ghost"}
          disabled={disabled}
          onClick={() =>
            setQuery({
              categoryId: null,
              petId: null,
              supplierId: null,
              statusProduct: null,
            })
          }
        >
          Reset
          <XCircle />
        </Button>
      )}
    </div>
  );
};
