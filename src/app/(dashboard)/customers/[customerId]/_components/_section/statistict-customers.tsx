"use client";
import React, { useMemo } from "react";
import { UpgradeDocument } from "./upgrade-document";
import { Customer } from "../../_api";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  Map,
  MapPinned,
  ShoppingBag,
  ShoppingBasket,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatistictCustomersProps {
  customer: Customer;
}

const OrderListSection = React.memo(
  ({
    title,
    icon: Icon,
    orders,
    emptyText,
  }: {
    title: string;
    icon: React.ElementType;
    orders: Customer["orders"]["include"];
    emptyText?: string;
  }) => (
    <div className="flex flex-col rounded-lg border border-gray-300">
      <div className="px-5 py-3 flex gap-3 items-center">
        <Icon className="size-4" />
        <h5>{title}</h5>
      </div>
      <Separator />
      <div className="px-5 py-3">
        <div className="border rounded-md border-gray-300 overflow-hidden divide-y">
          {orders.length > 0 ? (
            orders.map((order) => (
              <Button
                key={order.id}
                className="w-full flex-auto rounded-none justify-start group hover:bg-gray-100"
                variant="ghost"
                asChild
              >
                <Link href={`/orders/${order.id}`}>
                  <ShoppingBag className="size-3.5" />
                  <ChevronRight className="size-3.5" />
                  <p className="group-hover:underline text-xs">#{order.id}</p>
                  <Badge
                    className={cn(
                      "text-xs py-0 rounded-full ml-auto capitalize text-black",
                      order.status === "PACKING" && "bg-yellow-200",
                      ["CANCELLED", "EXPIRED"].includes(order.status) &&
                        "bg-red-200",
                      order.status === "WAITING_PAYMENT" && "bg-blue-200",
                      order.status === "SHIPPING" && "bg-violet-200",
                      order.status === "DELIVERED" && "bg-green-200"
                    )}
                  >
                    {order.status === "PACKING"
                      ? "Processed"
                      : order.status.replaceAll("_", " ").toLowerCase()}
                  </Badge>
                </Link>
              </Button>
            ))
          ) : (
            <div className="p-5 flex justify-center items-center h-20 text-xs font-semibold bg-gray-50 text-gray-500">
              {emptyText || "No orders yet."}
            </div>
          )}
        </div>
      </div>
    </div>
  )
);

const AddressSection = React.memo(({ customer }: { customer: Customer }) => (
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
                    {[
                      { label: "Phone", value: address.phoneNumber },
                      { label: "Address Detail", value: address.detail },
                      { label: "Address", value: address.address },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex flex-col gap-0.5 group cursor-default"
                      >
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="text-sm font-medium group-hover:underline">
                          {value}
                        </p>
                      </div>
                    ))}
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
));

export const StatistictCustomers: React.FC<StatistictCustomersProps> =
  React.memo(({ customer }) => {
    const { customerId } = useParams();

    const showUpgradeDocument = useMemo(
      () =>
        ["PETSHOP", "VETERINARIAN"].includes(customer.role as string) ||
        customer.role !== customer.newRole,
      [customer.role, customer.newRole]
    );

    return (
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          {showUpgradeDocument && (
            <UpgradeDocument
              customer={customer}
              customerId={customerId as string}
            />
          )}
          <AddressSection customer={customer} />
        </div>

        <div className="flex flex-col gap-6">
          <OrderListSection
            title="Successfully Orders"
            icon={ShoppingBasket}
            orders={customer.orders.include}
          />
          <OrderListSection
            title="Processed/Cancelled Orders"
            icon={ShoppingBasket}
            orders={customer.orders.exclude}
          />
        </div>
      </div>
    );
  });

OrderListSection.displayName = "OrderListSection";
AddressSection.displayName = "AddressSection";
StatistictCustomers.displayName = "StatistictCustomers";
