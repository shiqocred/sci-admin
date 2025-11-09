import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, ImageIcon } from "lucide-react";
import Link from "next/link";

export const ParamsLoading = ({ mode }: { mode: "create" | "edit" }) => {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="size-7 hover:bg-gray-200"
            asChild
          >
            <Link href="/banners">
              <ImageIcon className="size-5" />
            </Link>
          </Button>
          <ChevronRight className="size-4 text-gray-500" />
          <h1 className="text-xl font-semibold">
            {mode === "edit" ? "Edit" : "Create"} Banner
          </h1>
          {mode === "edit" && (
            <>
              <ChevronRight className="size-4 text-gray-500" />
              <Skeleton className="w-32 h-7" />
            </>
          )}
        </div>
        {mode === "edit" && (
          <div className="flex items-center gap-2">
            <Skeleton className="size-8" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="size-8" />
          </div>
        )}
      </div>
      <div className="w-full grid gap-6 grid-cols-7">
        <Skeleton className="h-[550px] w-full col-span-4" />
        <Skeleton className="h-[400px] w-full col-span-3" />
      </div>
    </div>
  );
};
