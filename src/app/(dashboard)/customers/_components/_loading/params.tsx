import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, UserRound } from "lucide-react";
import Link from "next/link";

export const ParamsLoading = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex items-center gap-4 justify-between">
        <div className="flex gap-2 items-center">
          <Button size={"icon"} className="size-8" variant={"ghost"} asChild>
            <Link href={"/customers"}>
              <UserRound />
            </Link>
          </Button>
          <ChevronRight className="size-4" />
          <h1 className="text-xl font-semibold">Detail Customers</h1>
        </div>
        <div className="flex gap-2 items-center">
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-6 w-full">
        <Skeleton className="h-[183px] w-full" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
};
