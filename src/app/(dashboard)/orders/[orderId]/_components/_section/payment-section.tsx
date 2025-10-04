import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/lib/utils";
import React from "react";
import { OrderProps } from "../../_api";

export const PaymentSection = ({
  orderData,
}: {
  orderData: OrderProps | undefined;
}) => {
  return (
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
              <p>- {formatRupiah(orderData?.pricing.discount ?? 0)}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p>Shipping Cost</p>
            <p>{formatRupiah(orderData?.pricing.shipping ?? 0)}</p>
          </div>
          {orderData?.pricing.isFreeShiping && (
            <div className="flex items-center justify-between ml-2">
              <p>- Free Shipping</p>
              <p>- {formatRupiah(orderData?.pricing.shipping ?? 0)}</p>
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
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(" ")}
            </p>
          </div>
          <div className="flex flex-col w-full">
            <h5 className="font-medium">Channel</h5>
            <p className="capitalize">
              {orderData?.payment.channel?.toLowerCase()}
            </p>
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
  );
};
