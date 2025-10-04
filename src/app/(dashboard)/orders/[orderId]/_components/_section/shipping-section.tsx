import React from "react";
import { OrderProps } from "../../_api";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const ShippingSection = ({
  orderData,
}: {
  orderData: OrderProps | undefined;
}) => {
  return (
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
              orderData?.shipping.status !== "PENDING" && "text-black",
              (orderData?.shipping.status === "CONFIRMED" ||
                orderData?.shipping.status === "PICKING_UP" ||
                orderData?.shipping.status === "ALLOCATED") &&
                "!bg-blue-300",
              (orderData?.shipping.status === "PICKED" ||
                orderData?.shipping.status === "DROPPING_OFF") &&
                "!bg-yellow-300",
              orderData?.shipping.status === "DELIVERED" && "!bg-green-300",
              orderData?.shipping.status === "CANCELLED" && "!bg-red-300"
            )}
          >
            {orderData?.shipping.status}
          </Badge>
        </div>
      </div>
    </div>
  );
};
