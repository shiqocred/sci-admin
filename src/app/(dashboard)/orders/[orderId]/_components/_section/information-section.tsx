import React from "react";
import { OrderProps } from "../../_api";
import { Badge } from "@/components/ui/badge";

export const InformationSection = ({
  orderData,
}: {
  orderData: OrderProps | undefined;
}) => {
  return (
    <div className="flex flex-col gap-4 border rounded-lg bg-gray-50 p-5 w-full">
      <h3 className="font-semibold">Order Information</h3>
      <div className="flex flex-col gap-0.5 w-full ">
        <h5 className="font-medium">Customer Note</h5>
        <p className="text-gray-700 underline underline-offset-2">
          {orderData?.note ? orderData?.note : "-"}
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <h5 className="font-medium">Status</h5>
        <Badge className="capitalize">{orderData?.status}</Badge>
      </div>
    </div>
  );
};
