import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ProductOutput } from "../../_api";
import Image from "next/image";
import { cn, formatRupiah, pronoun, sizesImage } from "@/lib/utils";
import { ChevronDown, TagIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const ProductsSection = ({
  productsList,
}: {
  productsList: ProductOutput[] | undefined;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4 border rounded-lg bg-gray-50 p-5 w-full">
      <h3 className="font-semibold">
        Products{" "}
        <span className="text-sm font-normal">({productsList?.length})</span>
      </h3>
      {productsList && (
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-3">
            {productsList.slice(0, 2).map((product) => (
              <div
                key={product.id}
                className="flex bg-white rounded-md border border-gray-300 text-sm flex-col"
              >
                <div className="flex items-center gap-3 p-3">
                  <div className="relative h-20 aspect-square border rounded">
                    <Image
                      fill
                      src={product.image ?? `/assets/images/logo-sci.png`}
                      alt="product"
                      sizes={sizesImage}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col justify-between h-full w-full">
                    <p className="line-clamp-2 font-semibold">{product.name}</p>
                    {product.default_variant && (
                      <div className="items-center flex justify-between">
                        <p>
                          x
                          {parseFloat(
                            product.default_variant.quantity ?? "0"
                          ).toLocaleString()}
                        </p>
                        <p className="whitespace-nowrap flex-none text-end font-medium">
                          {formatRupiah(product.default_variant.price)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {product.variant && (
                  <div className="flex flex-col border-t divide-y border-gray-300">
                    {product.variant.map((variant) => (
                      <div
                        key={variant.id}
                        className="grid grid-cols-5 gap-3 p-3"
                      >
                        <div className="flex items-center gap-3 col-span-2">
                          <TagIcon className="size-3.5" />
                          <p className="font-semibold line-clamp-1">
                            {variant.name}
                          </p>
                        </div>
                        <p className="flex items-center col-span-1">
                          x
                          {parseFloat(variant.quantity ?? "0").toLocaleString()}
                        </p>
                        <div className="whitespace-nowrap col-span-2 flex-none text-end font-medium">
                          {formatRupiah(variant.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {productsList.length > 2 && (
            <CollapsibleContent className="flex flex-col gap-3">
              {productsList.slice(2, productsList.length).map((product) => (
                <div
                  key={product.id}
                  className="flex bg-white rounded-md border border-gray-300 text-sm flex-col"
                >
                  <div className="flex items-center gap-3 p-3">
                    <div className="relative h-20 aspect-square border rounded">
                      <Image
                        fill
                        src={product.image ?? `/assets/images/logo-sci.png`}
                        alt="product"
                        sizes={sizesImage}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex flex-col justify-between h-full w-full">
                      <p className="line-clamp-2 font-semibold">
                        {product.name}
                      </p>
                      {product.default_variant && (
                        <div className="items-center flex justify-between">
                          <p>
                            x
                            {parseFloat(
                              product.default_variant.quantity ?? "0"
                            ).toLocaleString()}
                          </p>
                          <p className="whitespace-nowrap flex-none text-end font-medium">
                            {formatRupiah(product.default_variant.price)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {product.variant && (
                    <div className="flex flex-col border-t divide-y border-gray-300">
                      {product.variant.map((variant) => (
                        <div
                          key={variant.id}
                          className="grid grid-cols-5 gap-3 p-3"
                        >
                          <div className="flex items-center gap-3 col-span-2">
                            <TagIcon className="size-3.5" />
                            <p className="font-semibold line-clamp-1">
                              {variant.name}
                            </p>
                          </div>
                          <p className="flex items-center col-span-1">
                            x
                            {parseFloat(
                              variant.quantity ?? "0"
                            ).toLocaleString()}
                          </p>
                          <div className="whitespace-nowrap col-span-2 flex-none text-end font-medium">
                            {formatRupiah(variant.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CollapsibleContent>
          )}
          {productsList.length > 2 && (
            <div className="flex items-center gap-2">
              <Separator className="flex-auto bg-gradient-to-l from-gray-400 to-transparent" />
              <CollapsibleTrigger className="rounded-full border px-3 text-xs h-7 flex items-center justify-center whitespace-nowrap hover:border-gray-400">
                {isOpen ? "Collapse" : "Expand"} {productsList.length - 2}{" "}
                product
                {pronoun(productsList.length - 2)}{" "}
                <ChevronDown
                  className={cn("size-3 ml-2", isOpen && "rotate-180")}
                />
              </CollapsibleTrigger>
              <Separator className="flex-auto bg-gradient-to-r from-gray-400 to-transparent" />
            </div>
          )}
        </Collapsible>
      )}
    </div>
  );
};
