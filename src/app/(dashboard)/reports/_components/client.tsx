"use client";

import { OrderExport } from "@/components/exports/orders";
import { ProductExport } from "@/components/exports/products";
import { TopCustomers } from "@/components/exports/top-customers";
import React from "react";

export const Client = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex items-center gap-4 justify-between">
        <h1 className="text-xl font-semibold">Reports</h1>
      </div>
      <div className="w-full grid grid-cols-2 xl:grid-cols-3 gap-6">
        <OrderExport isMarketing={true} />
        <TopCustomers isMarketing={true} />
        <ProductExport isMarketing={true} />
      </div>
    </div>
  );
};
