"use client";

import { useParams } from "next/navigation";
import React, { useMemo } from "react";
import { useGetOrder } from "../_api";
import { cn, formatRupiah, sizesImage } from "@/lib/utils";
import Image from "next/image";
import { TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Client = () => {
  const { orderId } = useParams();

  const { data } = useGetOrder({ id: orderId as string });

  const productsList = useMemo(() => data?.data.products, [data]);
  const orderData = useMemo(() => data?.data, [data]);
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex items-center gap-4 justify-between">
        <h1 className="text-xl font-semibold">Detail Orders</h1>
      </div>
      <div className="flex w-full flex-col gap-3">
        <div className="grid grid-cols-7 gap-4">
          <div className="col-span-4 w-full">
            <div className="flex flex-col gap-4 border rounded-lg bg-gray-50 p-5 w-full">
              {productsList &&
                productsList.map((product) => (
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
            </div>
          </div>
          <div className="col-span-3 w-full">
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex flex-col gap-4 border rounded-lg bg-gray-50 p-5 w-full">
                <h3 className="font-semibold">Notes</h3>
                <p>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos,
                  ipsam!
                </p>
              </div>
              <div className="flex flex-col gap-4 border rounded-lg bg-gray-50 p-5 w-full">
                <h3 className="font-semibold">Customer Information</h3>
                <div className="flex flex-col gap-2 w-full">
                  <h5 className="font-medium">Customer</h5>
                  <Button className="h-auto justify-start p-2 gap-2 font-normal text-start bg-gray-50 border-gray-300 border hover:bg-white text-black">
                    <div className="size-10 relative rounded overflow-hidden border flex-none">
                      <Image
                        fill
                        src={orderData?.image ?? `/assets/images/logo-sci.png`}
                        alt="product"
                        sizes={sizesImage}
                        className="object-cover"
                      />
                    </div>
                    <div className="w-full flex flex-col">
                      <p className="font-medium">{orderData?.name}</p>
                      <p className="text-xs">{orderData?.email}</p>
                    </div>
                  </Button>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <h5 className="font-medium">Customer</h5>
                  <Button className="h-auto justify-start p-2 gap-2 font-normal text-start bg-gray-50 border-gray-300 border hover:bg-white text-black">
                    <div className="size-10 relative rounded overflow-hidden border flex-none">
                      <Image
                        fill
                        src={orderData?.image ?? `/assets/images/logo-sci.png`}
                        alt="product"
                        sizes={sizesImage}
                        className="object-cover"
                      />
                    </div>
                    <div className="w-full flex flex-col">
                      <p className="font-medium">{orderData?.name}</p>
                      <p className="text-xs">{orderData?.email}</p>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
