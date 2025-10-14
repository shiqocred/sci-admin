"use client";

import React, { useState, useEffect, MouseEvent } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TooltipText } from "@/providers/tooltip-provider";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useDownloadExport, useGetExportFilters } from "./_api";
import { ExportForm } from "./form";
import { ExportingDialog } from "../exporting-dialog";
import { DATA_ROLES } from "../libs/utils";

/* ---------------------- Main Component ---------------------- */
export const ProductExport = ({
  isMarketing = false,
}: {
  isMarketing?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>(DATA_ROLES.map((i) => i.value));
  const [categories, setCategories] = useState<string[]>([]);
  const [pets, setPets] = useState<string[]>([]);

  const { mutate: exportData, isPending: isExporting } = useDownloadExport();
  const { data, isPending } = useGetExportFilters();

  const dataFilter = data?.data;

  const getIsAll = (arr: string[], compare?: string[]) =>
    compare ? arr.length === compare.length : false;

  const isAllRole = getIsAll(
    roles,
    DATA_ROLES.map((i) => i.value)
  );

  const isAllSupplier = getIsAll(
    suppliers,
    dataFilter?.suppliers.map((i) => i.value)
  );

  const isAllPet = getIsAll(
    pets,
    dataFilter?.pets.map((i) => i.value)
  );

  const isAllCategory = getIsAll(
    categories,
    dataFilter?.categories.map((i) => i.value)
  );

  /* ---------------------- Handle Download ---------------------- */
  const handleDownload = (e: MouseEvent) => {
    e.preventDefault();
    const body = {
      suppliers: isAllSupplier ? [] : suppliers,
      pets: isAllPet ? [] : pets,
      roles: isAllRole ? [] : roles,
      categories: isAllCategory ? [] : categories,
      isAllRole,
      isAllSupplier,
      isAllPet,
      isAllCategory,
    };

    exportData(
      { body },
      {
        onSuccess: (res) => {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement("a");
          link.href = url;
          link.download = `ITEM LISTING REPORT - ${format(new Date(), "P_HH_mm_ss", { locale: id })}.xlsx`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        },
      }
    );
  };

  /* ---------------------- Initial Data Load ---------------------- */
  useEffect(() => {
    if (!dataFilter) return;
    setSuppliers(dataFilter.suppliers.map((i) => i.value));
    setCategories(dataFilter.categories.map((i) => i.value));
    setPets(dataFilter.pets.map((i) => i.value));
  }, [dataFilter]);

  /* ---------------------- Marketing Mode ---------------------- */
  if (isMarketing) {
    return (
      <div className="border rounded-lg w-full flex flex-col overflow-hidden p-3 gap-5">
        {isExporting && <ExportingDialog />}
        <div className="w-full h-20 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-5 rounded-md">
          <h3 className="font-bold text-lg">Products Report</h3>
        </div>

        <ExportForm
          {...{
            suppliers,
            setSuppliers,
            categories,
            setCategories,
            roles,
            setRoles,
            pets,
            setPets,
            dataFilter,
            handleDownload,
          }}
          isMarketing
        />
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
          <ExportForm
            {...{
              suppliers,
              setSuppliers,
              categories,
              setCategories,
              roles,
              setRoles,
              pets,
              setPets,
              dataFilter,
              handleDownload,
            }}
          />
        </PopoverContent>
      </Popover>
    </>
  );
};
