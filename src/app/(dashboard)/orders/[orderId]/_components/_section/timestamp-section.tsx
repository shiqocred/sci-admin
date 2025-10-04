import React from "react";
import { OrderProps } from "../../_api";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const TimestampSection = ({
  orderData,
}: {
  orderData: OrderProps | undefined;
}) => {
  return (
    <div className="flex flex-col gap-4 border rounded-lg bg-gray-50 p-5 w-full">
      <h3 className="font-semibold">Timestamp</h3>
      {orderData?.timestamp.created && (
        <div className="flex flex-col gap-0.5 w-full ">
          <p className="font-medium">Order at</p>
          <p className="text-gray-700">
            {format(new Date(orderData?.timestamp.created), "PPP 'at' HH:mm", {
              locale: id,
            })}
          </p>
        </div>
      )}
      {orderData?.timestamp.paid && (
        <div className="flex flex-col gap-0.5 w-full ">
          <p className="font-medium">Paid at</p>
          <p className="text-gray-700">
            {format(new Date(orderData?.timestamp.paid), "PPP 'at' HH:mm", {
              locale: id,
            })}
          </p>
        </div>
      )}
      {orderData?.timestamp.shipping && (
        <div className="flex flex-col gap-0.5 w-full ">
          <p className="font-medium">Shipping at</p>
          <p className="text-gray-700">
            {format(new Date(orderData?.timestamp.shipping), "PPP 'at' HH:mm", {
              locale: id,
            })}
          </p>
        </div>
      )}
      {orderData?.timestamp.delivered && (
        <div className="flex flex-col gap-0.5 w-full ">
          <p className="font-medium">Delivered at</p>
          <p className="text-gray-700">
            {format(
              new Date(orderData?.timestamp.delivered),
              "PPP 'at' HH:mm",
              { locale: id }
            )}
          </p>
        </div>
      )}
      {orderData?.timestamp.cancelled && (
        <div className="flex flex-col gap-0.5 w-full ">
          <p className="font-medium">Cancelled at</p>
          <p className="text-gray-700">
            {format(
              new Date(orderData?.timestamp.cancelled),
              "PPP 'at' HH:mm",
              { locale: id }
            )}
          </p>
        </div>
      )}
      {orderData?.timestamp.expired && (
        <div className="flex flex-col gap-0.5 w-full ">
          <p className="font-medium">Expired at</p>
          <p className="text-gray-700">
            {format(new Date(orderData?.timestamp.expired), "PPP 'at' HH:mm", {
              locale: id,
            })}
          </p>
        </div>
      )}
    </div>
  );
};
