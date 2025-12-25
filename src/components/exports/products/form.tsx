"use client";

import React, { MouseEvent, useMemo, useState } from "react";
import { SelectPopover } from "./select";
import { DownloadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DATA_ROLES } from "../libs/utils";
import { DownloadExportType, GetExportFiltersType } from ".";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ExportFormProps {
  data: GetExportFiltersType;
  exportData: DownloadExportType;
  isMarketing?: boolean;
}

export const ExportForm = ({
  data,
  exportData,
  isMarketing = false,
}: ExportFormProps) => {
  const [suppliers, setSuppliers] = useState<string[]>(
    data.data.suppliers.map((i) => i.value) ?? [],
  );
  const [categories, setCategories] = useState<string[]>(
    data.data.categories.map((i) => i.value) ?? [],
  );
  const [pets, setPets] = useState<string[]>(
    data.data.pets.map((i) => i.value) ?? [],
  );
  const [roles, setRoles] = useState<string[]>(DATA_ROLES.map((i) => i.value));

  const getIsAll = (arr: string[], compare?: string[]) =>
    compare ? arr.length === compare.length : false;

  const isAllRole = getIsAll(
    roles,
    DATA_ROLES.map((i) => i.value),
  );

  const isAllSupplier = getIsAll(
    suppliers,
    data.data.suppliers.map((i) => i.value),
  );

  const isAllPet = getIsAll(
    pets,
    data.data.pets.map((i) => i.value),
  );

  const isAllCategory = getIsAll(
    categories,
    data.data.categories.map((i) => i.value),
  );
  /* ---------------------- Memos & Callbacks ---------------------- */
  const disableDownload = useMemo(
    () =>
      suppliers.length === 0 ||
      categories.length === 0 ||
      pets.length === 0 ||
      roles.length === 0,
    [suppliers, categories, pets, roles],
  );

  const suppliersData = data.data.suppliers ?? [];
  const petsData = data.data.pets ?? [];
  const categoriesData = data.data.categories ?? [];

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
      },
    );
  };

  /* ---------------------- JSX ---------------------- */
  return (
    <div className={cn("flex flex-col gap-3", isMarketing && "h-full")}>
      <SelectPopover
        label="Available For (Customer Role)"
        placeholder="Select Customer Role..."
        data={DATA_ROLES}
        selected={roles}
        onChange={setRoles}
      />
      <SelectPopover
        label="Category"
        placeholder="Select Category..."
        data={categoriesData}
        selected={categories}
        onChange={setCategories}
      />
      <SelectPopover
        label="Supplier"
        placeholder="Select Supplier..."
        data={suppliersData}
        selected={suppliers}
        onChange={setSuppliers}
      />
      <SelectPopover
        label="Pet"
        placeholder="Select Pet..."
        data={petsData}
        selected={pets}
        onChange={setPets}
      />

      {/* DOWNLOAD */}
      <Button
        className={cn("text-xs h-8", isMarketing && "mt-auto")}
        onClick={handleDownload}
        disabled={disableDownload}
      >
        <DownloadCloud className="size-3.5" />
        Download
      </Button>
    </div>
  );
};
