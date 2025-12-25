import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export const RangeLoading = () => {
  return (
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
    </div>
  );
};
