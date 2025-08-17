"use client";

import { Button } from "@/components/ui/button";
import { cn, formatRupiah, pronoun, sizesImage } from "@/lib/utils";
import {
  ChartNoAxesGantt,
  ChevronRight,
  Edit2,
  Loader,
  Printer,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetShowProduct } from "../../_api";
import Image from "next/image";
import { TooltipText } from "@/providers/tooltip-provider";
import { useDeleteProduct } from "../../../_api";
import { useConfirm } from "@/hooks/use-confirm";
import { Badge } from "@/components/ui/badge";

export const Client = () => {
  const { productId } = useParams();

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Product",
    "This action cannot be undone",
    "destructive"
  );

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const { data, isPending, refetch, isRefetching } = useGetShowProduct({
    productId: productId as string,
  });

  const product = useMemo(() => {
    return data?.data;
  }, [data]);

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteProduct({ params: { id: productId as string } });
  };

  const isDefault = product?.variants[0].isDefault;
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
          <h1 className="text-xl font-semibold">Detail Products</h1>
        </div>
        <div className="flex items-center gap-3">
          <TooltipText value="Reload data">
            <Button
              disabled={isDeleting || isPending}
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
          <TooltipText value="Edit">
            <Button
              disabled={isDeleting || isPending}
              size={"icon"}
              variant={"secondary"}
              className="size-7 hover:bg-yellow-200"
              asChild
            >
              <Link href={`/products/${productId}/edit`}>
                <Edit2 className="size-4" />
              </Link>
            </Button>
          </TooltipText>
          <TooltipText value="Print">
            <Button
              disabled={isDeleting || isPending}
              size={"icon"}
              variant={"secondary"}
              className="size-7 hover:bg-blue-200 hover:cursor-pointer"
            >
              <Printer className="size-4" />
            </Button>
          </TooltipText>
          <TooltipText value="Delete">
            <Button
              disabled={isDeleting || isPending}
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
      {isDeleting || isPending || !product ? (
        <div className="w-full flex flex-col items-center justify-center mx-auto gap-2 py-20 text-sm">
          <Loader className="animate-spin" />
          <p>Memuat...</p>
        </div>
      ) : (
        <div className="w-full mx-auto gap-6 text-sm">
          <div className="border-b pb-6 flex flex-col gap-6">
            <h1 className="text-3xl font-bold text-foreground">
              {product.title}
            </h1>
            <div className="flex items-start gap-6">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">DESCRIPTION</p>
                <p className="text-sm font-medium leading-relaxed">
                  {product.description}
                </p>
              </div>
              <div className="flex items-center gap-4 ml-auto flex-none">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">CATEGORY</p>
                  <p className="font-medium">
                    {product.category?.name || "Uncategorized"}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">STATUS</p>
                  <Badge variant={product.status ? "default" : "secondary"}>
                    {product.status ? "Active" : "Draft"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="py-8">
            {/* Product Image */}
            <div className="mb-10 flex flex-wrap gap-3">
              {product &&
                product.images.map((item, i) => (
                  <div
                    key={item}
                    className="w-32 aspect-square overflow-hidden rounded-md relative border border-gray-200 shadow-sm"
                  >
                    <Image
                      src={item}
                      alt={`${product?.title}-${i}`}
                      fill
                      sizes={sizesImage}
                      className="object-cover"
                    />
                  </div>
                ))}
            </div>

            {/* Product Information */}
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Product Information
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col col-span-2 rounded-md overflow-hidden border border-gray-200 h-fit">
                  <div className="w-full flex items-center border-b border-gray-200">
                    <div className="w-40 flex-none bg-gray-100 px-6 py-3 font-medium">
                      <p>Product Id</p>
                    </div>
                    <div className="w-full py-3 px-6 capitalize">
                      {product?.id}
                    </div>
                  </div>
                  {isDefault && (
                    <div className="grid grid-cols-2 border-b border-gray-200">
                      <div className="w-full flex items-center">
                        <div className="w-40 flex-none bg-gray-100 px-6 py-3 font-medium">
                          <p>SKU</p>
                        </div>
                        <div className="w-full py-3 px-6 capitalize">
                          {product.variants[0].sku}
                        </div>
                      </div>
                      <div className="w-full flex items-center">
                        <div className="w-40 flex-none bg-gray-100 px-6 py-3 font-medium">
                          <p>Barcode</p>
                        </div>
                        <div className="w-full py-3 px-6 capitalize">
                          {product.variants[0].barcode}
                        </div>
                      </div>
                    </div>
                  )}
                  {isDefault && (
                    <div className="grid grid-cols-2 border-b border-gray-200">
                      <div className="w-full flex items-center">
                        <div className="w-40 flex-none bg-gray-100 px-6 py-3 font-medium">
                          <p>Stock</p>
                        </div>
                        <div className="w-full py-3 px-6">
                          {product.variants[0].stock} Product
                          {pronoun(product.variants[0].stock)}
                        </div>
                      </div>
                      <div className="w-full flex items-center">
                        <div className="w-40 flex-none bg-gray-100 px-6 py-3 font-medium">
                          <p>Weight</p>
                        </div>
                        <div className="w-full py-3 px-6">
                          {product.variants[0].weight} gram
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="w-full flex items-center border-b border-gray-200">
                    <div className="w-40 flex-none bg-gray-100 px-6 py-3 font-medium">
                      <p>No. Registration</p>
                    </div>
                    <div className="w-full py-3 px-6 capitalize">
                      {product?.registrationNumber
                        ? product?.registrationNumber
                        : "-"}
                    </div>
                  </div>
                  <div className="w-full flex items-center border-b border-gray-200">
                    <div className="w-40 flex-none bg-gray-100 px-6 py-3 font-medium">
                      <p>Packaging</p>
                    </div>
                    <div className="w-full py-3 px-6 capitalize">
                      {product?.packaging ? product?.packaging : "-"}
                    </div>
                  </div>
                  <div className="w-full flex items-center">
                    <div className="w-40 flex-none bg-gray-100 px-6 py-3 font-medium">
                      <p>Available For</p>
                    </div>
                    <div className="w-full py-3 px-6 capitalize flex items-center gap-3">
                      {product.available.length === 3
                        ? "All Customer"
                        : product.available.map((role) => (
                            <Badge
                              key={role}
                              className="rounded-full font-normal"
                            >
                              {role.toLowerCase() === "basic" && "Pet Owner"}
                              {role.toLowerCase() === "petshop" && "Pet Shop"}
                              {role.toLowerCase() === "veterinarian" &&
                                "Pet Clinic"}
                            </Badge>
                          ))}
                    </div>
                  </div>
                </div>
                <div className="col-span-1 flex flex-col gap-4">
                  <div className="w-full rounded-md overflow-hidden border border-gray-200">
                    <div className="w-full bg-gray-100 px-6 py-3 font-medium">
                      <p>Supplier</p>
                    </div>
                    <div className="w-full py-3 px-6 capitalize">
                      {product?.supplier.name}
                    </div>
                  </div>
                  <div className="w-full rounded-md overflow-hidden border border-gray-200">
                    <div className="w-full bg-gray-100 px-6 py-3 font-medium">
                      <p>Pets</p>
                    </div>
                    <div className="flex flex-col w-full">
                      {product &&
                        product.pets.map((item, i) => (
                          <div
                            key={item.id}
                            className={cn(
                              "w-full py-3 px-6 border-b border-gray-200 capitalize",
                              i === product.pets.length - 1 && "border-b-0"
                            )}
                          >
                            {item.name}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* For single variant - elegant 2 column pricing */}
            {isDefault && (
              <div className="mb-10">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                  Pricing
                </h2>
                <div className="flex flex-col gap-8">
                  <div className="space-y-4">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Normal
                    </div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatRupiah(product.variants[0].price)}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 rounded-md overflow-hidden border border-gray-200 h-fit">
                    {product.available.some((i) => i === "BASIC") && (
                      <div className="w-full flex items-center">
                        <div className="w-36 flex-none bg-gray-100 px-6 py-3 font-medium">
                          <p>Pet Owner</p>
                        </div>
                        <div className="w-full py-3 px-6 capitalize">
                          {formatRupiah(
                            product.variants[0].pricing.find(
                              (i) => i.role === "BASIC"
                            )?.price ?? "0"
                          )}
                        </div>
                      </div>
                    )}
                    {product.available.some((i) => i === "PETSHOP") && (
                      <div className="w-full flex items-center">
                        <div className="w-36 flex-none bg-gray-100 px-6 py-3 font-medium">
                          <p>Pet Shop</p>
                        </div>
                        <div className="w-full py-3 px-6 capitalize">
                          {formatRupiah(
                            product.variants[0].pricing.find(
                              (i) => i.role === "PETSHOP"
                            )?.price ?? "0"
                          )}
                        </div>
                      </div>
                    )}
                    {product.available.some((i) => i === "VETERINARIAN") && (
                      <div className="w-full flex items-center">
                        <div className="w-36 flex-none bg-gray-100 px-6 py-3 font-medium">
                          <p>Pet Clinic</p>
                        </div>
                        <div className="w-full py-3 px-6 capitalize">
                          {formatRupiah(
                            product.variants[0].pricing.find(
                              (i) => i.role === "VETERINARIAN"
                            )?.price ?? "0"
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* For multiple variants */}
            {!isDefault && (
              <div className="mb-10">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                  Variants
                </h2>
                <div className="space-y-4">
                  {product?.variants.map((variant, index) => (
                    <div
                      key={`${variant.barcode}-${index}`}
                      className={`border border-gray-200 rounded-md`}
                    >
                      <div className="flex justify-between px-6 py-3 bg-gray-100 items-center border-b">
                        <div className="font-medium text-gray-900 items-center flex gap-2">
                          <span>{variant.name}</span>
                          <span>-</span>
                          <span className="text-xs text-gray-700">
                            {parseFloat(variant.stock) > 0
                              ? variant.stock
                              : "Not"}{" "}
                            Available
                          </span>
                        </div>
                        <p>{formatRupiah(variant.price)}</p>
                      </div>
                      <div className="flex flex-col text-xs">
                        <div className="grid grid-cols-3 p-6">
                          <div>
                            <span className="text-gray-700 uppercase tracking-wider">
                              SKU:{" "}
                            </span>
                            <span className="text-gray-900">{variant.sku}</span>
                          </div>
                          <div>
                            <span className="text-gray-700 uppercase tracking-wider">
                              Barcode:{" "}
                            </span>
                            <span className="text-gray-900">
                              {variant.barcode}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-700 uppercase tracking-wider">
                              Weight:{" "}
                            </span>
                            <span className="text-gray-900">
                              {variant.weight} gram
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 h-12 border-t">
                          <div className="flex items-center justify-center h-full border-r px-6">
                            <p>Price</p>
                          </div>
                          <div
                            className={cn(
                              "grid size-full",
                              product.available.length === 2 && "grid-cols-2",
                              product.available.length === 3 && "grid-cols-3"
                            )}
                          >
                            {product.available.some((i) => i === "BASIC") && (
                              <div className="px-6 flex h-full items-center border-r gap-1 last:border-0">
                                <span className="text-gray-700 uppercase tracking-wider">
                                  Pet Owner:
                                </span>
                                <span className="text-gray-900">
                                  {formatRupiah(
                                    variant.pricing.find(
                                      (i) => i.role === "BASIC"
                                    )?.price ?? "0"
                                  )}
                                </span>
                              </div>
                            )}
                            {product.available.some((i) => i === "PETSHOP") && (
                              <div className="px-6 flex h-full items-center border-r gap-1 last:border-0">
                                <span className="text-gray-700 uppercase tracking-wider">
                                  Pet Shop:
                                </span>
                                <span className="text-gray-900">
                                  {formatRupiah(
                                    variant.pricing.find(
                                      (i) => i.role === "PETSHOP"
                                    )?.price ?? "0"
                                  )}
                                </span>
                              </div>
                            )}
                            {product.available.some(
                              (i) => i === "VETERINARIAN"
                            ) && (
                              <div className="px-6 flex h-full items-center">
                                <span className="text-gray-700 uppercase tracking-wider gap-1">
                                  Pet Clinic:
                                </span>
                                <span className="text-gray-900">
                                  {formatRupiah(
                                    variant.pricing.find(
                                      (i) => i.role === "VETERINARIAN"
                                    )?.price ?? "0"
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-6">
                {/* Composition */}
                <div className="border rounded-lg overflow-hidden">
                  <h2 className="text-lg font-semibold text-gray-900 py-3 px-5 border-b border-gray-200 bg-gray-100">
                    Compotition
                  </h2>
                  <div className="flex flex-col max-w-xl py-3 px-5">
                    {product?.compositions.map((comp, index) => (
                      <div
                        key={`${comp.name}-${comp.value}-${index}`}
                        className="flex items-center gap-1 justify-between h-10"
                      >
                        <div className="text-sm font-medium text-gray-700 tracking-wider">
                          {comp.name}
                        </div>
                        <div className="h-[2px] flex-1 bg-[radial-gradient(circle,_#364153_1px,_transparent_1px)] [background-size:5px_4px] mt-2" />
                        <div className="text-sm text-gray-900">
                          {comp.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                {/* Medical Information */}
                <div className="border rounded-lg overflow-hidden">
                  <h2 className="text-lg font-semibold text-gray-900 py-3 px-5 border-b border-gray-200 bg-gray-100">
                    Medical Indication
                  </h2>
                  <div className=" py-3 px-5">
                    {product?.indication ? (
                      <div
                        className="text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: product.indication,
                        }}
                      />
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <h2 className="text-lg font-semibold text-gray-900 py-3 px-5 border-b border-gray-200 bg-gray-100">
                    Dosage & Usage
                  </h2>
                  <div className=" py-3 px-5">
                    {product?.dosageUsage ? (
                      <div
                        className="text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: product?.dosageUsage ?? "",
                        }}
                      />
                    ) : (
                      "-"
                    )}
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <h2 className="text-lg font-semibold text-gray-900 py-3 px-5 border-b border-gray-200 bg-gray-100">
                    Storage Instructions
                  </h2>
                  <p className="text-sm text-gray-800 leading-relaxed py-3 px-5">
                    {product?.storageInstruction
                      ? product?.storageInstruction
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
