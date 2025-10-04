"use client";

import { useParams } from "next/navigation";
import React, { MouseEvent, useMemo } from "react";
import {
  useCancelOrder,
  useDownloadInvoice,
  useGetOrder,
  usePayOrder,
  useSendOrder,
} from "../_api";
import {
  ChevronRight,
  Download,
  Loader,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import Link from "next/link";

import { ProductsSection } from "./_section/products-section";
import { PaymentSection } from "./_section/payment-section";
import { ShippingSection } from "./_section/shipping-section";
import { HistoriesSection } from "./_section/histories-section";
import { InformationSection } from "./_section/information-section";
import { TimestampSection } from "./_section/timestamp-section";
import { CustomerSection } from "./_section/customer-section";
import { ActionSection } from "./_section/action-section";

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
  const { mutate: downloadInvoice, isPending: isDownloading } =
    useDownloadInvoice();

  const isLoading = isPaying || isCanceling || isSending;

  const { data, isPending } = useGetOrder({ id: orderId as string });

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

  const handleDownloadInvoice = (e: MouseEvent) => {
    e.preventDefault();
    downloadInvoice(
      { params: { id: orderId as string } },
      {
        onSuccess: async (res) => {
          const url = window.URL.createObjectURL(res.data);

          const link = document.createElement("a");
          link.href = url;
          link.download = `invoice-${orderId}.pdf`;
          document.body.appendChild(link);
          link.click();
        },
      }
    );
  };
  return (
    <div className="w-full flex flex-col gap-6 pb-20">
      <PayDialog />
      <CancelDialog />
      <SendDialog />
      <div className="w-full flex items-center justify-between">
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
        <Button
          onClick={handleDownloadInvoice}
          size={"sm"}
          className="text-xs"
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          {isDownloading ? "Downloading..." : "Order Invoice"}
        </Button>
      </div>
      <div className="flex w-full flex-col gap-3">
        {isPending ? (
          <div className="h-[50vh] w-full flex items-center justify-center flex-col gap-2">
            <Loader className="size-6 animate-spin" />
            <p className="animate-pulse ml-2 text-sm">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-4">
            <div className="col-span-4 w-full relative">
              <div className="flex flex-col gap-4 sticky top-4">
                <ProductsSection productsList={productsList} />
                <PaymentSection orderData={orderData} />
                <ShippingSection orderData={orderData} />
                <HistoriesSection historiesList={historiesList} />
              </div>
            </div>
            <div className="col-span-3 w-full relative">
              <div className="flex flex-col gap-4 text-sm sticky top-4">
                <InformationSection orderData={orderData} />
                <TimestampSection orderData={orderData} />
                <CustomerSection orderData={orderData} />
                <ActionSection
                  orderData={orderData}
                  isLoading={isLoading}
                  isCanceling={isCanceling}
                  isPaying={isPaying}
                  isSending={isSending}
                  handleCancel={handleCancel}
                  handlePayment={handlePayment}
                  handleSend={handleSend}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
