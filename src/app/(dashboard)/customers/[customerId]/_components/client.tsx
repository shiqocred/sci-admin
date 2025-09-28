"use client";

import React, { useMemo, useState } from "react";
import { useGetCustomer } from "../_api/query/use-get-customer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  IdCard,
  Map,
  MapPinned,
  RefreshCw,
  ShoppingBag,
  ShoppingBasket,
  Trash2,
  UserRound,
  XCircle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteUser, useUpdateReview, useVerifyEmail } from "../../_api";
import { invalidateQuery } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export const Client = () => {
  const { customerId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isReject, setIsReject] = useState(false);
  const [input, setInput] = useState("");

  const [ApproveDialog, confirmApprove] = useConfirm(
    "Approve Document",
    "This action cannot be undone"
  );

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
  const { mutate: update, isPending: isUpdating } = useUpdateReview();

  const { data, refetch, isRefetching, isPending } = useGetCustomer({
    userId: customerId as string,
  });

  const loading =
    isPending || isRefetching || isVerifiying || isUpdating || isDeleting;

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

  const handleApprove = async () => {
    const ok = await confirmApprove();
    if (!ok) return;

    update(
      { body: { status: "approve" }, params: { id: customerId as string } },
      {
        onSuccess: async () => {
          setInput("");
          setIsReject(false);
          await invalidateQuery(queryClient, [
            ["customers-detail", customerId as string],
          ]);
        },
      }
    );
  };

  const handleReject = async () => {
    update(
      {
        body: { status: "reject", message: input },
        params: { id: customerId as string },
      },
      {
        onSuccess: async () => {
          setInput("");
          setIsReject(false);
          await invalidateQuery(queryClient, [
            ["customers-detail", customerId as string],
          ]);
        },
      }
    );
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <VerifyDialog />
      <ApproveDialog />
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
                <p className="text-xs text-gray-500">Total Order</p>
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
                  {customer.lastOrder}
                </p>
              </div>
              <div className="flex flex-col gap-0.5 group cursor-default">
                <p className="text-xs text-gray-500">Joined at</p>
                <p className="text-sm font-medium group-hover:underline">
                  {customer.createdAt}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
              {(customer.role === "PETSHOP" ||
                customer.role === "VETERINARIAN" ||
                customer.role !== customer.newRole) && (
                <div className="flex flex-col rounded-lg border border-gray-300">
                  <div className="px-5 py-3 flex gap-3 items-center justify-between">
                    <div className="flex gap-3 items-center">
                      <IdCard className="size-4" />
                      <h5>Document Updrading</h5>
                    </div>
                    {customer.role !== customer.newRole ? (
                      <div className="flex items-center gap-2">
                        <Badge variant={"outline"} className="text-[10px]">
                          {customer.role && formatRole(customer.role)}
                        </Badge>
                        {customer.status === "REJECTED" ? (
                          <XCircle className="size-4" />
                        ) : (
                          <ArrowRight className="size-4" />
                        )}
                        <Badge
                          variant={"outline"}
                          className={cn(
                            "text-[10px]",
                            customer.status === "REJECTED" && "line-through"
                          )}
                        >
                          {customer.newRole && formatRole(customer.newRole)}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Badge variant={"outline"} className="text-[10px]">
                          {customer.role && formatRole(customer.role)}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <Separator />
                  {customer.status === "REJECTED" ? (
                    <div className="px-5 py-3 flex flex-col gap-2 text-sm items-center">
                      <p className="text-xl font-semibold text-red-500">
                        REJECTED
                      </p>
                      <p>{`"${customer.message}"`}</p>
                    </div>
                  ) : (
                    <div className="px-5 py-3 flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        {(customer.role === "PETSHOP" ||
                          customer.newRole === "PETSHOP") &&
                        customer.personalIdType ? (
                          <div className="flex flex-col gap-1.5">
                            <p className="text-xs font-semibold">
                              {customer.personalIdType === "NIK"
                                ? "KTP"
                                : customer.personalIdType}
                            </p>
                            <div className="aspect-[107/67] w-full relative shadow rounded-md overflow-hidden">
                              <Image
                                src={
                                  customer.personalIdFile ??
                                  "/images/logo-sci.png"
                                }
                                fill
                                alt={customer.personalIdType}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            <p className="text-xs font-semibold">KTP</p>
                            <div className="aspect-[107/67] w-full relative shadow rounded-md overflow-hidden">
                              <Image
                                src={
                                  customer.personalIdFile ??
                                  "/images/logo-sci.png"
                                }
                                fill
                                alt="KTP"
                              />
                            </div>
                          </div>
                        )}
                        {customer.role === "PETSHOP" ||
                        customer.newRole === "PETSHOP" ? (
                          <div className="flex flex-col gap-1.5">
                            <p className="text-xs font-semibold">
                              Pet Shop Building
                            </p>
                            <div className="aspect-[107/67] w-full relative shadow rounded-md overflow-hidden">
                              <Image
                                src={
                                  customer.storefrontFile ??
                                  "/images/logo-sci.png"
                                }
                                fill
                                alt="storefront"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            <p className="text-xs font-semibold">KTA</p>
                            <div className="aspect-[107/67] w-full relative shadow rounded-md overflow-hidden">
                              <Image
                                src={
                                  customer.veterinarianIdFile ??
                                  "/images/logo-sci.png"
                                }
                                fill
                                alt="KTA"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 group cursor-default">
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="text-sm font-medium group-hover:underline">
                          {customer.fullName}
                        </p>
                      </div>
                      <div className="flex flex-col gap-0.5 group cursor-default">
                        <p className="text-xs text-gray-500">
                          {customer.role === "VETERINARIAN"
                            ? "NIK Number"
                            : `${customer.personalIdType} Number`}
                        </p>
                        <p className="text-sm font-medium group-hover:underline">
                          {customer.personalId}
                        </p>
                      </div>
                      {customer.role === "VETERINARIAN" && (
                        <div className="flex flex-col gap-0.5 group cursor-default">
                          <p className="text-xs text-gray-500">KTA Number</p>
                          <p className="text-sm font-medium group-hover:underline">
                            {customer.veterinarianId}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  <Separator />
                  <div className="px-5 py-3 w-full">
                    {customer.role !== customer.newRole &&
                    customer.status === "PENDING" ? (
                      <div className="ml-auto flex items-center gap-3 w-fit">
                        <Button
                          size={"sm"}
                          className="text-xs bg-green-300 text-black hover:bg-green-400"
                          onClick={handleApprove}
                          disabled={loading}
                        >
                          <CheckCircle2 className="size-3.5" />
                          Approve
                        </Button>
                        <Dialog open={isReject} onOpenChange={setIsReject}>
                          <DialogTrigger asChild>
                            <Button
                              size={"sm"}
                              className="text-xs bg-red-300 text-black hover:bg-red-400"
                              disabled={loading}
                            >
                              <XCircle className="size-3.5" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent showCloseButton={false}>
                            <DialogHeader>
                              <DialogTitle>Reject Document</DialogTitle>
                              <DialogDescription>
                                This action cannot be undone
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-1.5">
                              <Label>Message</Label>
                              <Textarea
                                className="focus-visible:ring-0"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                variant={"outline"}
                                onClick={() => {
                                  setIsReject(false);
                                  setInput("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleReject}
                                disabled={!input}
                                className="bg-red-300 text-black hover:bg-red-400 "
                              >
                                Confirm
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      <p className="text-sm ml-auto w-fit">
                        {customer.status === "APPROVED"
                          ? "Approved"
                          : "Rejected"}{" "}
                        at {customer.updatedAt}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-col rounded-lg border border-gray-300">
                <div className="px-5 py-3 flex gap-3 items-center">
                  <MapPinned className="size-4" />
                  <h5>Addresses</h5>
                </div>
                <Separator />
                <div className="px-5 py-3">
                  <div className="border rounded-md border-gray-300">
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
                                <p className="text-xs text-gray-500">Phone</p>
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
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm font-medium group-hover:underline">
                                  {address.address}
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              </div>
            </div>
            <div className="">
              <div className="flex flex-col rounded-lg border border-gray-300">
                <div className="px-5 py-3 flex gap-3 items-center">
                  <ShoppingBasket className="size-4" />
                  <h5>Orders</h5>
                </div>
                <Separator />
                <div className="px-5 py-3">
                  <div className="border rounded-md border-gray-300 overflow-hidden divide-y">
                    {customer.orders.map((order) => (
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
                              order.status === "SHIPPING" && "bg-violet-200",
                              order.status === "DELIVERED" && "bg-green-200"
                            )}
                          >
                            {order.status === "PACKING"
                              ? "Processed"
                              : order.status.split("_").join(" ").toLowerCase()}
                          </Badge>
                        </Link>
                      </Button>
                    ))}
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
            <div className="flex flex-col gap-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      )}
    </div>
  );
};
