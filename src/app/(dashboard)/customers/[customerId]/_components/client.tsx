"use client";

import React, { useMemo } from "react";
import { useGetCustomer } from "../_api/query/use-get-customer";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  ChevronRight,
  CircleQuestionMark,
  Download,
  Map,
  MapPinned,
  RefreshCw,
  ShoppingBag,
  ShoppingBasket,
  Trash2,
  UserRound,
} from "lucide-react";
import { TooltipText } from "@/providers/tooltip-provider";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatRole, formatRupiah, pronoun } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteUser, useVerifyEmail } from "../../_api";
import { invalidateQuery } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { UpgradeDocument } from "./_section/upgrade-document";
import { format } from "date-fns";
import { useDownloadExport } from "../_api";
import { id } from "date-fns/locale";

export const Client = () => {
  const { customerId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [VerifyDialog, confirmVerify] = useConfirm(
    "Verify Email",
    "This action cannot be undone"
  );

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete User",
    "This action cannot be undone",
    "destructive"
  );

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const { mutate: verifyEmail, isPending: isVerifiying } = useVerifyEmail();

  const { data, refetch, isRefetching, isPending } = useGetCustomer({
    userId: customerId as string,
  });

  const loading = isPending || isRefetching || isVerifiying || isDeleting;

  const customer = useMemo(() => {
    return data?.data;
  }, [data]);

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteUser(
      { params: { id: customerId as string } },
      {
        onSuccess: () => {
          router.push("/customers");
        },
      }
    );
  };

  const handleVerify = async () => {
    const ok = await confirmVerify();
    if (!ok) return;
    verifyEmail(
      { params: { id: customerId as string } },
      {
        onSuccess: async () => {
          await invalidateQuery(queryClient, [
            ["customers-detail", customerId as string],
          ]);
        },
      }
    );
  };

  const { mutate: exportData, isPending: isExporting } = useDownloadExport();

  const handleDownload = () => {
    exportData(
      { params: { customerId: customerId as string } },
      {
        onSuccess: (res) => {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement("a");
          link.href = url;
          link.download = `REPORT CUSTOMER (${customer?.name}) - ${format(new Date(), "P_HH_mm_ss", { locale: id })}.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        },
      }
    );
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <VerifyDialog />
      <DeleteDialog />
      <div className="w-full flex items-center gap-4 justify-between">
        <div className="flex gap-2 items-center">
          <Button size={"icon"} className="size-8" variant={"ghost"} asChild>
            <Link href={"/customers"}>
              <UserRound />
            </Link>
          </Button>
          <ChevronRight className="size-4" />
          <h1 className="text-xl font-semibold">Detail Customers</h1>
        </div>
        <div className="flex gap-2 items-center">
          <TooltipText value="Reload Data" side="bottom">
            <Button
              size={"icon"}
              className="size-8"
              variant={"outline"}
              onClick={() => refetch()}
              disabled={loading}
            >
              <RefreshCw
                className={cn("size-3.5", loading && "animate-spin")}
              />
            </Button>
          </TooltipText>
          <TooltipText value="Export Detail" side="bottom">
            <Button
              size={"icon"}
              className="size-8"
              variant={"outline"}
              onClick={handleDownload}
              disabled={isExporting || loading}
            >
              <Download className="size-3.5" />
            </Button>
          </TooltipText>
          <TooltipText value="Delete" side="bottom">
            <Button
              size={"icon"}
              className="size-8"
              variant={"outline"}
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </TooltipText>
        </div>
      </div>
      <Separator />
      {customer && !isPending ? (
        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-col rounded-lg border border-gray-300">
            <div className="flex items-center gap-4 px-5 py-3">
              <div className="size-10 relative rounded-md overflow-hidden shadow">
                <Image
                  src={customer?.image ?? "/images/logo-sci.png"}
                  fill
                  alt={customer.name}
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold">{customer.name}</h3>
            </div>
            <Separator />
            <div className="px-5 py-3 grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-0.5 group cursor-default">
                <p className="text-xs text-gray-500">Email</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium group-hover:underline">
                    {customer.email}
                  </p>
                  {customer.emailVerified ? (
                    <TooltipText value={"Email verified"}>
                      <CheckCircle className="size-3 text-green-600" />
                    </TooltipText>
                  ) : (
                    <Button
                      onClick={handleVerify}
                      className="text-[10px] h-5 py-0 px-2 hover:bg-gray-700 cursor-pointer"
                      disabled={loading}
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-0.5 group cursor-default">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium group-hover:underline">
                  {customer.phoneNumber}
                </p>
              </div>
              <div className="flex flex-col gap-0.5 group cursor-default">
                <p className="text-xs text-gray-500">Role</p>
                <p className="text-sm font-medium group-hover:underline">
                  {customer.role && formatRole(customer.role)}
                </p>
              </div>
              <div className="flex flex-col gap-0.5 group cursor-default">
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <p>Total Order</p>
                  <TooltipText value={"Summary of delivered orders"}>
                    <CircleQuestionMark className="size-3" />
                  </TooltipText>
                </div>
                <p className="text-sm font-medium group-hover:underline">
                  {customer.totalOrder} Order{pronoun(customer.totalOrder)}{" "}
                  <span className="text-xs text-gray-500">
                    ({formatRupiah(customer.totalAmount)})
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-0.5 group cursor-default">
                <p className="text-xs text-gray-500">Last Order</p>
                <p className="text-sm font-medium group-hover:underline">
                  {customer.lastOrder
                    ? format(new Date(customer.lastOrder), "PP 'at' HH:mm")
                    : "-"}
                </p>
              </div>
              <div className="flex flex-col gap-0.5 group cursor-default">
                <p className="text-xs text-gray-500">Joined at</p>
                <p className="text-sm font-medium group-hover:underline">
                  {customer.createdAt
                    ? format(new Date(customer.createdAt), "PP 'at' HH:mm")
                    : "-"}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="">
              <div className="flex flex-col gap-6">
                {(customer.role === "PETSHOP" ||
                  customer.role === "VETERINARIAN" ||
                  customer.role !== customer.newRole) && (
                  <UpgradeDocument
                    customer={customer}
                    customerId={customerId as string}
                    queryClient={queryClient}
                  />
                )}
                <div className="flex flex-col rounded-lg border border-gray-300">
                  <div className="px-5 py-3 flex gap-3 items-center">
                    <MapPinned className="size-4" />
                    <h5>Addresses</h5>
                  </div>
                  <Separator />
                  <div className="px-5 py-3">
                    <div className="border rounded-md border-gray-300 overflow-hidden">
                      {customer.addresses.length > 0 ? (
                        <Accordion type="single" collapsible>
                          {customer.addresses.map((address) => (
                            <AccordionItem key={address.id} value={address.id}>
                              <AccordionTrigger className="px-5">
                                <div className="flex items-center gap-2">
                                  <Map className="size-4" />
                                  <ChevronRight className="size-3.5" />
                                  <p>{address.name}</p>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="bg-gray-50">
                                <Separator />
                                <div className="px-5 pt-5 flex flex-col gap-3">
                                  <div className="flex flex-col gap-0.5 group cursor-default">
                                    <p className="text-xs text-gray-500">
                                      Phone
                                    </p>
                                    <p className="text-sm font-medium group-hover:underline">
                                      {address.phoneNumber}
                                    </p>
                                  </div>
                                  <div className="flex flex-col gap-0.5 group cursor-default">
                                    <p className="text-xs text-gray-500">
                                      Address Detail
                                    </p>
                                    <p className="text-sm font-medium group-hover:underline">
                                      {address.detail}
                                    </p>
                                  </div>
                                  <div className="flex flex-col gap-0.5 group cursor-default">
                                    <p className="text-xs text-gray-500">
                                      Address
                                    </p>
                                    <p className="text-sm font-medium group-hover:underline">
                                      {address.address}
                                    </p>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <div className="p-5 flex justify-center items-center h-20 text-xs font-semibold bg-gray-50 text-gray-500">
                          No address yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col rounded-lg border border-gray-300">
                  <div className="px-5 py-3 flex gap-3 items-center">
                    <ShoppingBasket className="size-4" />
                    <h5>Successfully Orders</h5>
                  </div>
                  <Separator />
                  <div className="px-5 py-3">
                    <div className="border rounded-md border-gray-300 overflow-hidden divide-y">
                      {customer.orders.include.length > 0 ? (
                        customer.orders.include.map((order) => (
                          <Button
                            key={order.id}
                            className="w-full flex-auto rounded-none justify-start group hover:bg-gray-100"
                            variant={"ghost"}
                            asChild
                          >
                            <Link href={`/orders/${order.id}`}>
                              <ShoppingBag className="size-3.5" />
                              <ChevronRight className="size-3.5" />
                              <p className="group-hover:underline group-hover:underline-offset-2 text-xs">
                                #{order.id}
                              </p>
                              <Badge
                                className={cn(
                                  "text-xs py-0 rounded-full ml-auto capitalize text-black",
                                  order.status === "PACKING" && "bg-yellow-200",
                                  (order.status === "CANCELLED" ||
                                    order.status === "EXPIRED") &&
                                    "bg-red-200",
                                  order.status === "WAITING_PAYMENT" &&
                                    "bg-blue-200",
                                  order.status === "SHIPPING" &&
                                    "bg-violet-200",
                                  order.status === "DELIVERED" && "bg-green-200"
                                )}
                              >
                                {order.status === "PACKING"
                                  ? "Processed"
                                  : order.status
                                      .split("_")
                                      .join(" ")
                                      .toLowerCase()}
                              </Badge>
                            </Link>
                          </Button>
                        ))
                      ) : (
                        <div className="p-5 flex justify-center items-center h-20 text-xs font-semibold bg-gray-50 text-gray-500">
                          No orders yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col rounded-lg border border-gray-300">
                  <div className="px-5 py-3 flex gap-3 items-center">
                    <ShoppingBasket className="size-4" />
                    <h5>Proccessed/Cancelled Orders</h5>
                  </div>
                  <Separator />
                  <div className="px-5 py-3">
                    <div className="border rounded-md border-gray-300 overflow-hidden divide-y">
                      {customer.orders.exclude.length > 0 ? (
                        customer.orders.exclude.map((order) => (
                          <Button
                            key={order.id}
                            className="w-full flex-auto rounded-none justify-start group hover:bg-gray-100"
                            variant={"ghost"}
                            asChild
                          >
                            <Link href={`/orders/${order.id}`}>
                              <ShoppingBag className="size-3.5" />
                              <ChevronRight className="size-3.5" />
                              <p className="group-hover:underline group-hover:underline-offset-2 text-xs">
                                #{order.id}
                              </p>
                              <Badge
                                className={cn(
                                  "text-xs py-0 rounded-full ml-auto capitalize text-black",
                                  order.status === "PACKING" && "bg-yellow-200",
                                  (order.status === "CANCELLED" ||
                                    order.status === "EXPIRED") &&
                                    "bg-red-200",
                                  order.status === "WAITING_PAYMENT" &&
                                    "bg-blue-200",
                                  order.status === "SHIPPING" &&
                                    "bg-violet-200",
                                  order.status === "DELIVERED" && "bg-green-200"
                                )}
                              >
                                {order.status === "PACKING"
                                  ? "Processed"
                                  : order.status
                                      .split("_")
                                      .join(" ")
                                      .toLowerCase()}
                              </Badge>
                            </Link>
                          </Button>
                        ))
                      ) : (
                        <div className="p-5 flex justify-center items-center h-20 text-xs font-semibold bg-gray-50 text-gray-500">
                          No orders yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full">
          <Skeleton className="h-[183px] w-full" />
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      )}
    </div>
  );
};
