import React from "react";
import { OrderProps } from "../../_api";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { pronoun, sizesImage } from "@/lib/utils";
import { useRouter } from "next/navigation";

export const CustomerSection = ({
  orderData,
}: {
  orderData: OrderProps | undefined;
}) => {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 border rounded-lg bg-gray-50 p-5 w-full">
      <h3 className="font-semibold">Customer</h3>
      <Button
        onClick={() => router.push("/customers/" + orderData?.user.id)}
        className="h-auto justify-start p-2 gap-2 font-normal text-start bg-gray-50 border-gray-300 border hover:bg-white text-black cursor-pointer group"
      >
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
          <p className="font-medium group-hover:underline underline-offset-2">
            {orderData?.user.name}
          </p>
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
  );
};
