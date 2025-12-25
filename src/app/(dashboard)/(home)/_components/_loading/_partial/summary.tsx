import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export const SummaryLoading = () => {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="col-span-4 h-[150px]" />
      <div className="grid grid-cols-2 gap-6 w-full">
        <Skeleton className="w-full h-[300px]" />
        <Skeleton className="w-full h-[300px]" />
      </div>
    </div>
  );
};
