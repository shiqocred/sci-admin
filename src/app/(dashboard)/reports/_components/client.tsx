"use client";

import { OrderExport } from "@/components/exports/orders";
import { ProductExport } from "@/components/exports/products";
import { TopCustomers } from "@/components/exports/top-customers";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DownloadCloud, Loader2 } from "lucide-react";
import { useDownloadCustomersExport, useDownloadOrdersExport } from "../_api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MouseEvent } from "react";
import { ExportingDialog } from "@/components/exports/exporting-dialog";

export const Client = () => {
  const { mutate: mutateErpCustomers, isPending: isPendingCustomers } =
    useDownloadCustomersExport();
  const { mutate: mutateErpOrders, isPending: isPendingOrders } =
    useDownloadOrdersExport();

  const exportErpCustomers = (e: MouseEvent) => {
    e.preventDefault();
    mutateErpCustomers(
      {},
      {
        onSuccess: (res) => {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement("a");
          link.href = url;
          link.download = `ERP CUSTOMERS - ${format(new Date(), "P_HH_mm_ss", { locale: id })}.xlsx`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        },
      },
    );
  };

  const exportErpOrders = (e: MouseEvent) => {
    e.preventDefault();
    mutateErpOrders(
      {},
      {
        onSuccess: (res) => {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement("a");
          link.href = url;
          link.download = `ERP ORDERS - ${format(new Date(), "P_HH_mm_ss", { locale: id })}.xlsx`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        },
      },
    );
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {(isPendingCustomers || isPendingOrders) && <ExportingDialog />}
      <div className="w-full flex items-center gap-4 justify-between">
        <h1 className="text-xl font-semibold">Export Reports</h1>
      </div>
      <div className="flex flex-col w-full gap-6">
        <div className="flex flex-col gap-4">
          <p className="text-xl font-bold">Marketing</p>
          <div className="w-full grid grid-cols-2 xl:grid-cols-3 gap-6">
            <OrderExport isMarketing={true} />
            <TopCustomers isMarketing={true} />
            <ProductExport isMarketing={true} />
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-4">
          <p className="text-xl font-bold">ERP</p>
          <div className="w-full grid grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="border rounded-lg p-3 gap-5 flex flex-col">
              <div className="w-full h-20 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-5 rounded-md">
                <h3 className="font-bold text-lg">Customers</h3>
              </div>
              <Button
                className="w-full"
                onClick={exportErpCustomers}
                disabled={isPendingCustomers}
              >
                {isPendingCustomers ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <DownloadCloud />
                )}
                Download
              </Button>
            </div>
            <div className="border rounded-lg p-3 gap-5 flex flex-col">
              <div className="w-full h-20 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-5 rounded-md">
                <h3 className="font-bold text-lg">Orders</h3>
              </div>
              <Button
                className="w-full"
                onClick={exportErpOrders}
                disabled={isPendingOrders}
              >
                {isPendingOrders ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <DownloadCloud />
                )}
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
