import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export const MainLoading = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex items-center gap-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Separator className="flex-auto" />
          <Skeleton className="w-[350px] h-8" />
          <Skeleton className="w-[400px] h-8" />
          <Separator className="flex-auto" />
        </div>
        <div className="grid grid-cols-11 gap-6 w-full">
          <Skeleton className="col-span-7 h-[350px]" />
          <Skeleton className="col-span-4 h-[350px]" />
        </div>
        <Separator />
        <div className="flex flex-col gap-6">
          <Skeleton className="col-span-4 h-[150px]" />
          <div className="grid grid-cols-2 gap-6 w-full">
            <Skeleton className="w-full h-[300px]" />
            <Skeleton className="w-full h-[300px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
