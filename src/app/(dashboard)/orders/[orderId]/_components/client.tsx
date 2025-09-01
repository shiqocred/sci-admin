"use client";

import { useParams } from "next/navigation";
import React, { useMemo } from "react";
import {
  useCancelOrder,
  useGetOrder,
  usePayOrder,
  useSendOrder,
} from "../_api";
import { cn, formatRupiah, pronoun, sizesImage } from "@/lib/utils";
import Image from "next/image";
import {
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  FileCheckIcon,
  Loader2,
  PackageCheck,
  RefreshCcw,
  ShoppingBag,
  TagIcon,
  Truck,
  UserX2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useConfirm } from "@/hooks/use-confirm";
import {
  Timeline,
  TimelineTitle,
  TimelineHeader,
  TimelineItem,
  TimelineSeparator,
  TimelineIndicator,
  TimelineContent,
  TimelineDate,
} from "@/components/ui/timeline";
import Link from "next/link";

export const Client = () => {
  const { orderId } = useParams();

  const [SendDialog, confirmSend] = useConfirm(
    "Send Current Order?",
    "This action cannot be undone",
    "default"
  );
  const [PayDialog, confirmPay] = useConfirm(
    "Pay Current Order?",
    "This action cannot be undone",
    "default"
  );
  const [CancelDialog, confirmCancel] = useConfirm(
    "Cancel Current Order?",
    "This action cannot be undone",
    "destructive"
  );

  const { mutate: payOrder, isPending: isPaying } = usePayOrder();
  const { mutate: cancelOrder, isPending: isCanceling } = useCancelOrder();
  const { mutate: sendOrder, isPending: isSending } = useSendOrder();

  const isLoading = isPaying || isCanceling || isSending;

  const { data } = useGetOrder({ id: orderId as string });

  const historiesList = useMemo(() => data?.data.histories, [data]);
  const productsList = useMemo(() => data?.data.products, [data]);
  const orderData = useMemo(() => data?.data, [data]);

  const handlePayment = async () => {
    const ok = await confirmPay();
    if (!ok) return;
    payOrder({ params: { id: orderId as string } });
  };
  const handleCancel = async () => {
    const ok = await confirmCancel();
    if (!ok) return;
    cancelOrder({ params: { id: orderId as string } });
  };
  const handleSend = async () => {
    const ok = await confirmSend();
    if (!ok) return;
    sendOrder({ params: { id: orderId as string } });
  };
  return (
    <div className="w-full flex flex-col gap-6 pb-20">
      <PayDialog />
      <CancelDialog />
      <SendDialog />
      <div className="w-full flex items-center gap-1">
        <Button size={"icon"} variant={"ghost"} asChild>
          <Link href={"/orders"}>
            <ShoppingBag className="size-5" />
          </Link>
        </Button>
        <ChevronRight className="size-5" />
        <h1 className="text-xl font-semibold">Detail Orders</h1>
        <ChevronRight className="size-5" />
        <p>#{orderData?.id}</p>
      </div>
      <div className="flex w-full flex-col gap-3">
        <div className="grid grid-cols-7 gap-4">
          <div className="col-span-4 w-full relative">
            <div className="flex flex-col gap-4 sticky top-4">
              <div className="flex flex-col gap-4 border rounded-lg bg-gray-50 p-5 w-full">
                <h3 className="font-semibold">Products</h3>
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
              <div className="flex flex-col gap-4 border rounded-lg bg-gray-50 p-5 w-full text-sm">
                <h3 className="font-semibold">Payment Information</h3>
                <div className="flex flex-col border rounded-md">
                  <div className="flex flex-col gap-2 p-3">
                    <div className="flex items-center justify-between">
                      <p>Subtotal</p>
                      <p>{formatRupiah(orderData?.pricing.products ?? 0)}</p>
                    </div>
                    {orderData?.pricing.discount && (
                      <div className="flex items-center justify-between ml-2">
                        <p>- Discount</p>
                        <p>
                          - {formatRupiah(orderData?.pricing.discount ?? 0)}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p>Shipping Cost</p>
                      <p>{formatRupiah(orderData?.pricing.shipping ?? 0)}</p>
                    </div>
                    {orderData?.pricing.isFreeShiping && (
                      <div className="flex items-center justify-between ml-2">
                        <p>- Free Shipping</p>
                        <p>
                          - {formatRupiah(orderData?.pricing.shipping ?? 0)}
                        </p>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="flex items-center p-3 justify-between font-semibold">
                    <p>Total Price</p>
                    <p>{formatRupiah(orderData?.pricing.total ?? 0)}</p>
                  </div>
                </div>
                {orderData?.timestamp.paid && (
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col w-full">
                      <h5 className="font-medium">Method</h5>
                      <p>
                        {(orderData?.payment.method ?? "")
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ")}
                      </p>
                    </div>
                    <div className="flex flex-col w-full">
                      <h5 className="font-medium">Channel</h5>
                      <p>{orderData?.payment.channel}</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-y-4">
                  <div className="flex flex-col w-full">
                    <h5 className="font-medium">Status</h5>
                    <Badge>{orderData?.payment.status}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 border rounded-lg bg-gray-50 p-5 w-full text-sm">
                <h3 className="font-semibold">Shipping Information</h3>
                <div className="flex flex-col w-full">
                  <h5 className="font-medium">Contact</h5>
                  <div className="w-full flex gap-2">
                    <p>{orderData?.shipping.contact.name}</p>
                    <p>|</p>
                    <p>{orderData?.shipping.contact.phone}</p>
                  </div>
                </div>
                <div className="flex flex-col w-full">
                  <h5 className="font-medium">Address</h5>
                  <Link
                    href={`https://www.google.com/maps?q=${orderData?.shipping.contact.latitude},${orderData?.shipping.contact.longitude}`}
                    target="_blank"
                    className="hover:underline"
                  >
                    {orderData?.shipping.contact.address_note},{" "}
                    {orderData?.shipping.contact.address}
                  </Link>
                </div>
                <div className="grid grid-cols-2">
                  <div className="flex flex-col gap-2 w-full">
                    <h5 className="font-medium">Courier</h5>
                    <div className="w-full flex">
                      <p>
                        {orderData?.shipping.courier.name}{" "}
                        <span className="text-xs text-gray-600">
                          ({orderData?.shipping.courier.company}{" "}
                          {orderData?.shipping.courier.type})
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <h5 className="font-medium">Estimate</h5>
                    <div className="w-full flex">
                      <p>{orderData?.shipping.duration}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <h5 className="font-medium">Waybill</h5>
                  <div className="w-full flex">
                    <p>{orderData?.shipping.courier.waybill ?? "-"}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <h5 className="font-medium">Status</h5>
                  <div className="w-full flex">
                    <Badge
                      className={cn(
                        orderData?.shipping.status !== "PENDING" &&
                          "text-black",
                        (orderData?.shipping.status === "CONFIRMED" ||
                          orderData?.shipping.status === "PICKING_UP" ||
                          orderData?.shipping.status === "ALLOCATED") &&
                          "!bg-blue-300",
                        (orderData?.shipping.status === "PICKED" ||
                          orderData?.shipping.status === "DROPPING_OFF") &&
                          "!bg-yellow-300",
                        orderData?.shipping.status === "DELIVERED" &&
                          "!bg-green-300",
                        orderData?.shipping.status === "CANCELLED" &&
                          "!bg-red-300"
                      )}
                    >
                      {orderData?.shipping.status}
                    </Badge>
                  </div>
                </div>
              </div>
              {historiesList && historiesList.length > 0 && (
                <div className="flex flex-col gap-4 border rounded-lg bg-gray-50 p-5 w-full text-sm">
                  <h3 className="font-semibold">Tracking Order</h3>
                  <Timeline>
                    {historiesList.map((item) => (
                      <TimelineItem
                        key={item.id}
                        step={0}
                        className="group-data-[orientation=vertical]/timeline:ms-10"
                      >
                        <TimelineHeader>
                          <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5" />
                          <TimelineDate className="mt-1 text-xs">
                            {format(
                              item.updatedAt ?? new Date(),
                              "PPP HH:mm:ss",
                              {
                                locale: id,
                              }
                            )}
                          </TimelineDate>
                          <TimelineIndicator
                            className={cn(
                              "bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7",
                              (item.status === "CONFIRMED" ||
                                item.status === "ALLOCATED") &&
                                "!bg-blue-500",
                              item.status === "DELIVERED" && "!bg-green-500",
                              (item.status === "RETURNED" ||
                                item.status === "RETURN_IN_TRANSIT" ||
                                item.status === "ON_HOLD") &&
                                "!bg-orange-500",
                              (item.status === "COURIER_NOT_FOUND" ||
                                item.status === "DISPOSED" ||
                                item.status === "CANCELLED") &&
                                "!bg-red-500"
                            )}
                          >
                            {(item.status === "CONFIRMED" ||
                              item.status === "ALLOCATED") && (
                              <FileCheckIcon size={14} />
                            )}
                            {(item.status === "PICKING_UP" ||
                              item.status === "DROPPING_OFF") && (
                              <Truck size={14} />
                            )}
                            {item.status === "PICKED" && (
                              <PackageCheck size={14} />
                            )}
                            {item.status === "COURIER_NOT_FOUND" && (
                              <UserX2 size={14} />
                            )}
                            {(item.status === "DISPOSED" ||
                              item.status === "CANCELLED") && <X size={14} />}
                            {(item.status === "RETURNED" ||
                              item.status === "RETURN_IN_TRANSIT") && (
                              <RefreshCcw size={14} />
                            )}
                            {item.status === "DELIVERED" && <Check size={14} />}
                            {item.status === "ON_HOLD" && <Clock size={14} />}
                          </TimelineIndicator>
                        </TimelineHeader>
                        <TimelineContent>
                          <TimelineTitle className="mt-0.5 text-sm">
                            {item.note}
                          </TimelineTitle>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                </div>
              )}
            </div>
          </div>
          <div className="col-span-3 w-full relative">
            <div className="flex flex-col gap-4 text-sm sticky top-4">
              <div className="flex flex-col gap-4 border rounded-lg bg-gray-50 p-5 w-full">
                <h3 className="font-semibold">Order Information</h3>
                <div className="flex flex-col gap-0.5 w-full ">
                  <h5 className="font-medium">Customer Note</h5>
                  <p className="text-gray-700 underline underline-offset-2">
                    {orderData?.note ? orderData?.note : "none"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <h5 className="font-medium">Status</h5>
                  <Badge className="capitalize">{orderData?.status}</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-4 border rounded-lg bg-gray-50 p-5 w-full">
                <h3 className="font-semibold">Timestamp</h3>
                {orderData?.timestamp.created && (
                  <div className="flex flex-col gap-0.5 w-full ">
                    <p className="font-medium">Order at</p>
                    <p className="text-gray-700">
                      {orderData?.timestamp.created}
                    </p>
                  </div>
                )}
                {orderData?.timestamp.paid && (
                  <div className="flex flex-col gap-0.5 w-full ">
                    <p className="font-medium">Paid at</p>
                    <p className="text-gray-700">{orderData?.timestamp.paid}</p>
                  </div>
                )}
                {orderData?.timestamp.shipping && (
                  <div className="flex flex-col gap-0.5 w-full ">
                    <p className="font-medium">Shipping at</p>
                    <p className="text-gray-700">
                      {orderData?.timestamp.shipping}
                    </p>
                  </div>
                )}
                {orderData?.timestamp.delivered && (
                  <div className="flex flex-col gap-0.5 w-full ">
                    <p className="font-medium">Delivered at</p>
                    <p className="text-gray-700">
                      {orderData?.timestamp.delivered}
                    </p>
                  </div>
                )}
                {orderData?.timestamp.cancelled && (
                  <div className="flex flex-col gap-0.5 w-full ">
                    <p className="font-medium">Cancelled at</p>
                    <p className="text-gray-700">
                      {orderData?.timestamp.cancelled}
                    </p>
                  </div>
                )}
                {orderData?.timestamp.expired && (
                  <div className="flex flex-col gap-0.5 w-full ">
                    <p className="font-medium">Expired at</p>
                    <p className="text-gray-700">
                      {orderData?.timestamp.expired}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4 border rounded-lg bg-gray-50 p-5 w-full">
                <h3 className="font-semibold">Customer</h3>
                <Button className="h-auto justify-start p-2 gap-2 font-normal text-start bg-gray-50 border-gray-300 border hover:bg-white text-black">
                  <div className="size-10 relative rounded overflow-hidden border flex-none">
                    <Image
                      fill
                      src={orderData?.user.image ?? `/images/logo-sci.png`}
                      alt="product"
                      sizes={sizesImage}
                      className="object-cover"
                    />
                  </div>
                  <div className="w-full flex flex-col">
                    <p className="font-medium">{orderData?.user.name}</p>
                    <p className="text-xs">{orderData?.user.email}</p>
                  </div>
                </Button>
                <div className="flex flex-col w-full">
                  <h5 className="font-medium">Total Orders</h5>
                  <p>
                    {orderData?.user.total_orders} order
                    {pronoun(orderData?.user.total_orders ?? 0)}
                  </p>
                </div>
              </div>
              {orderData?.status === "waiting payment" && (
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    disabled={isLoading}
                    className="col-span-1"
                    variant={"outline"}
                    onClick={handleCancel}
                  >
                    {isCanceling ? <Loader2 className="animate-spin" /> : <X />}
                    {isCanceling ? "Canceling..." : "Cancel Order"}
                  </Button>
                  <Button
                    disabled={isLoading}
                    className="col-span-2"
                    onClick={handlePayment}
                  >
                    {isPaying ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <CreditCard />
                    )}
                    {isPaying ? "Paying..." : "Mark as Paid"}
                  </Button>
                </div>
              )}
              {orderData?.status === "processed" && (
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    disabled={isLoading}
                    className="col-span-1"
                    variant={"outline"}
                    onClick={handleCancel}
                  >
                    {isCanceling ? <Loader2 className="animate-spin" /> : <X />}
                    {isCanceling ? "Canceling..." : "Cancel Order"}
                  </Button>
                  <Button
                    disabled={isLoading}
                    className="col-span-2"
                    onClick={handleSend}
                  >
                    {isSending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Truck />
                    )}
                    {isSending ? "Sending..." : "Send Order"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
