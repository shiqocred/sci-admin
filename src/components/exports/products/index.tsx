"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TooltipText } from "@/providers/tooltip-provider";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useDownloadExport, useGetExportFilters } from "./_api";
import { ExportForm } from "./form";
import { ExportingDialog } from "../exporting-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export type GetExportFiltersType = NonNullable<
  ReturnType<typeof useGetExportFilters>["data"]
>;
export type DownloadExportType = ReturnType<typeof useDownloadExport>["mutate"];

/* ---------------------- Main Component ---------------------- */
export const ProductExport = ({
  isMarketing = false,
}: {
  isMarketing?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: exportData, isPending: isExporting } = useDownloadExport();
  const { data, isPending } = useGetExportFilters();

  /* ---------------------- Marketing Mode ---------------------- */
  if (isMarketing) {
    return (
      <div className="border rounded-lg w-full flex flex-col overflow-hidden p-3 gap-5">
        {isExporting && <ExportingDialog />}
        <div className="w-full h-20 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-5 rounded-md">
          <h3 className="font-bold text-lg">Products Report</h3>
        </div>

        {data ? (
          <ExportForm exportData={exportData} data={data} isMarketing />
        ) : (
          <div className="w-full h-85 flex flex-col gap-4">
            <Skeleton className="size-full" />
            <Skeleton className="h-8 w-full flex-none" />
          </div>
        )}
      </div>
    );
  }

  /* ---------------------- Default (Popover) Mode ---------------------- */
  return (
    <>
      {isExporting && <ExportingDialog />}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <TooltipText value="Export Products Data" align="end">
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={isPending}
              className="size-8 flex-none disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" />
              )}
            </Button>
          </PopoverTrigger>
        </TooltipText>

        <PopoverContent align="end" sideOffset={10} className="p-3">
          {data && <ExportForm exportData={exportData} data={data} />}
        </PopoverContent>
      </Popover>
    </>
  );
};
