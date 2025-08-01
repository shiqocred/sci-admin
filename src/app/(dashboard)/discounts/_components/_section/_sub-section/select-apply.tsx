import React from "react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { InputProps } from "../../client";
import { OptionSelect } from "./_sub-sub-section/option-select";
import { SelectProduct } from "../discount-core";

interface ValueSelect {
  name: string;
  id: string;
}

interface SelectApplyProps {
  apply: string;
  input: InputProps;
  setInput: React.Dispatch<React.SetStateAction<InputProps>>;
  handleRemoveApply: (item: any) => void;
  pets: ValueSelect[];
  suppliers: ValueSelect[];
  categories: ValueSelect[];
  selectProducts: SelectProduct | undefined;
}

export const SelectApply = ({
  apply,
  input,
  setInput,
  handleRemoveApply,
  selectProducts,
  categories,
  suppliers,
  pets,
}: SelectApplyProps) => {
  const [inputProduct, setInputProduct] = React.useState("");
  const [productFormatted, setProductFormatted] = React.useState<
    {
      id: string;
      name: string;
      default_variant: any | null;
      variants: any[] | null;
    }[]
  >();

  const handleSelectApply = (item: any) => {
    if (input.selected.includes(item.id)) {
      handleRemoveApply(item.id);
    } else {
      setInput((prev) => ({
        ...prev,
        selected: [...prev.selected, item.id],
      }));
    }
  };

  const tittleTrigger = () => {
    if (apply === "categories") return "Categories";
    if (apply === "suppliers") return "Suppliers";
    if (apply === "pets") return "Pets";
    if (apply === "products") return "Products";
    return "";
  };

  React.useEffect(() => {
    setProductFormatted(selectProducts?.data);
  }, [selectProducts]);

  React.useEffect(() => {
    if (selectProducts) {
      const formatted = selectProducts?.data.filter((item) => {
        return (
          item.name.toLowerCase().includes(inputProduct.toLowerCase()) ||
          item.variants?.some((v) =>
            v.name.toLowerCase().includes(inputProduct.toLowerCase())
          )
        );
      });

      setProductFormatted(formatted);
    }
  }, [inputProduct]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="justify-between bg-transparent hover:border-gray-400 hover:bg-transparent font-normal shadow-none border-gray-300 group"
          variant={"outline"}
        >
          Select {tittleTrigger()}
          <ChevronDown className="group-data-[state=open]:rotate-180 transition-all" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        {apply !== "products" && (
          <Command>
            <CommandInput />
            <CommandList>
              <CommandGroup>
                {apply === "categories" &&
                  categories.map((item) => (
                    <OptionSelect
                      key={item.id}
                      input={input}
                      item={item}
                      handleSelectApply={handleSelectApply}
                    />
                  ))}
                {apply === "suppliers" &&
                  suppliers.map((item) => (
                    <OptionSelect
                      key={item.id}
                      input={input}
                      item={item}
                      handleSelectApply={handleSelectApply}
                    />
                  ))}
                {apply === "pets" &&
                  pets.map((item) => (
                    <OptionSelect
                      key={item.id}
                      input={input}
                      item={item}
                      handleSelectApply={handleSelectApply}
                    />
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
        {apply === "products" && (
          <div className="flex w-full flex-col">
            <div className="flex items-center relative">
              <Input
                value={inputProduct}
                onChange={(e) => setInputProduct(e.target.value)}
                className="rounded-none border-0 border-b pl-10 shadow-none focus-visible:ring-0 focus-visible:border-gray-300 border-gray-300"
              />
              <Search className="absolute left-3 size-4 text-gray-700" />
            </div>
            <div className="w-full flex items-center h-8 px-5 text-xs font-normal">
              <p className="w-full">Product</p>
              <p className="w-24 text-center flex-none">Available</p>
              <p className="w-32 flex-none">Normal price</p>
            </div>
            <div className="px-2 pb-2">
              <div className="max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto gap-2 flex flex-col">
                {productFormatted &&
                  productFormatted.map((item) => {
                    if (item.default_variant) {
                      return (
                        <Button
                          key={item.id}
                          variant={"outline"}
                          className="min-h-9 h-auto w-full text-start rounded font-normal px-3"
                          onClick={() =>
                            handleSelectApply(item.default_variant)
                          }
                        >
                          <div className="flex-col flex w-full gap-2">
                            <div className="flex item-center justify-between w-full">
                              <p className="w-full font-semibold">
                                {item.name}
                              </p>
                              <p className="w-24 text-center flex-none">
                                {item.default_variant.stock}
                              </p>
                              <p className="w-32 flex-none">
                                {formatRupiah(item.default_variant.normalPrice)}
                              </p>
                            </div>
                            <Separator />
                            <div className="grid w-full grid-cols-3">
                              <p>
                                Basic:{" "}
                                {formatRupiah(item.default_variant.normalPrice)}
                              </p>
                              <p>
                                Petshop:{" "}
                                {formatRupiah(
                                  item.default_variant.petShopPrice
                                )}
                              </p>
                              <p>
                                Veterinarian:{" "}
                                {formatRupiah(item.default_variant.doctorPrice)}
                              </p>
                            </div>
                          </div>
                          <Check
                            className={cn(
                              input.selected.includes(item.default_variant.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </Button>
                      );
                    } else {
                      return (
                        <div
                          key={item.id}
                          className="border rounded flex flex-col overflow-hidden flex-none h-auto"
                        >
                          <div className="text-sm px-3 h-8 font-semibold flex items-center">
                            {item.name}
                          </div>
                          {item.variants?.map((variant) => (
                            <Button
                              key={variant.id}
                              variant={"outline"}
                              className="min-h-9 h-auto w-full text-start rounded-none font-normal px-3 border-0 border-t"
                              onClick={() => handleSelectApply(variant)}
                            >
                              <div className="flex flex-col gap-2 w-full">
                                <div className="flex item-center justify-between w-full">
                                  <p className="w-full font-semibold">
                                    Variant {variant.name}
                                  </p>
                                  <p className="w-24 text-center flex-none">
                                    {variant.stock}
                                  </p>
                                  <p className="w-32 flex-none">
                                    {formatRupiah(variant.normalPrice)}
                                  </p>
                                </div>
                                <Separator />
                                <div className="grid w-full grid-cols-3">
                                  <p>
                                    Basic: {formatRupiah(variant.normalPrice)}
                                  </p>
                                  <p>
                                    Petshop:{" "}
                                    {formatRupiah(variant.petShopPrice)}
                                  </p>
                                  <p>
                                    Veterinarian:{" "}
                                    {formatRupiah(variant.doctorPrice)}
                                  </p>
                                </div>
                              </div>
                              <Check
                                className={cn(
                                  input.selected.includes(variant.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </Button>
                          ))}
                        </div>
                      );
                    }
                  })}
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
