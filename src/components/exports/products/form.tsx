"use client";

import React, { Dispatch, MouseEvent, SetStateAction, useMemo } from "react";
import { ProductExportProps } from "./_api";
import { SelectPopover } from "./select";
import { DownloadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DATA_ROLES } from "../libs/utils";

interface ExportFormProps {
  suppliers: string[];
  setSuppliers: Dispatch<SetStateAction<string[]>>;
  categories: string[];
  setCategories: Dispatch<SetStateAction<string[]>>;
  roles: string[];
  setRoles: Dispatch<SetStateAction<string[]>>;
  pets: string[];
  setPets: Dispatch<SetStateAction<string[]>>;
  dataFilter?: ProductExportProps;
  handleDownload: (e: MouseEvent) => void;
  isMarketing?: boolean;
}

export const ExportForm = ({
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
  isMarketing = false,
}: ExportFormProps) => {
  /* ---------------------- Memos & Callbacks ---------------------- */
  const disableDownload = useMemo(
    () =>
      suppliers.length === 0 ||
      categories.length === 0 ||
      pets.length === 0 ||
      roles.length === 0,
    [suppliers, categories, pets, roles]
  );

  const suppliersData = dataFilter?.suppliers ?? [];
  const petsData = dataFilter?.pets ?? [];
  const categoriesData = dataFilter?.categories ?? [];

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
