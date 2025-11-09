import { Skeleton } from "@/components/ui/skeleton";

export const MainLoading = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Banners</h1>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="size-8" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-8" />
            <Skeleton className="h-8 w-[118px]" />
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-3">
        <Skeleton className="w-full h-52" />
        <div className="flex items-center justify-between">
          <Skeleton className=" h-8 w-36" />
          <Skeleton className=" h-8 w-44" />
        </div>
      </div>
    </div>
  );
};
