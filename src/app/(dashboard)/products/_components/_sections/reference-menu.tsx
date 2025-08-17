import React, { useMemo, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetSelects } from "../../_api";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, CirclePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageInputError } from "@/components/message-input-error";

interface InputProps {
  title: string;
  description: string;
  indication: string;
  dosageUsage: string;
  storageInstruction: string;
  packaging: string;
  registrationNumber: string;
  isActive: boolean;
  categoryId: string;
  supplierId: string;
  available: string[];
}

interface ReferenceMenuProps {
  loading: boolean;
  setPetIds: React.Dispatch<React.SetStateAction<string[]>>;
  petIds: string[];
  setInput: React.Dispatch<React.SetStateAction<InputProps>>;
  input: InputProps;
  errors: any;
}

interface SelectItem {
  id: string;
  name: string;
}

interface PopoverSelectProps {
  label: string;
  value: string;
  options: SelectItem[];
  onChange: (value: string) => void;
  placeholder: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  valueMap: Map<string, string>;
  disabled: boolean;
  error: any;
}

// Reusable Popover Select Component
const PopoverSelect = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  isOpen,
  onOpenChange,
  valueMap,
  disabled,
  error,
}: PopoverSelectProps) => (
  <div className="flex flex-col gap-1.5 w-full">
    <Label>{label}</Label>
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-full justify-between bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 group overflow-hidden",
            error && "border-red-500 hover:border-red-500"
          )}
          variant="outline"
          disabled={disabled}
        >
          {value ? (
            <span className="font-normal w-full truncate text-left">
              {valueMap.get(value)}
            </span>
          ) : (
            <span className="font-normal text-gray-500 text-xs">
              {placeholder}
            </span>
          )}
          <ChevronDown className="text-gray-500 group-data-[state=open]:rotate-180 transition-all" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="min-w-[var(--radix-popover-trigger-width)] p-0"
        align="end"
      >
        <Command>
          <CommandInput />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  onSelect={(selectedValue) => {
                    onChange(selectedValue);
                    onOpenChange(false);
                  }}
                  value={option.id}
                  key={option.id}
                >
                  {option.name}
                  <Check
                    className={cn(
                      "hidden ml-auto",
                      option.id === value && "flex"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <MessageInputError error={error} />
  </div>
);

export const ReferenceMenu = ({
  loading,
  setPetIds,
  petIds,
  setInput,
  input,
  errors,
}: ReferenceMenuProps) => {
  const [openStates, setOpenStates] = useState({
    category: false,
    supplier: false,
    pet: false,
  });

  const { data: selects, isPending } = useGetSelects();

  // Memoize data lists
  const categoriesList = useMemo(
    () => selects?.data.categories ?? [],
    [selects]
  );
  const suppliersList = useMemo(() => selects?.data.suppliers ?? [], [selects]);
  const petsList = useMemo(() => selects?.data.pets ?? [], [selects]);

  // Memoize lookup maps for better performance
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categoriesList.forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categoriesList]);

  const supplierMap = useMemo(() => {
    const map = new Map<string, string>();
    suppliersList.forEach((supplier) => map.set(supplier.id, supplier.name));
    return map;
  }, [suppliersList]);

  const petMap = useMemo(() => {
    const map = new Map<string, string>();
    petsList.forEach((pet) => map.set(pet.id, pet.name));
    return map;
  }, [petsList]);

  const handleRemovePet = (id: string) => {
    setPetIds((prev) => prev.filter((petId) => petId !== id));
  };

  const handleChangePet = (id: string) => {
    setPetIds((prev) =>
      prev.includes(id) ? prev.filter((petId) => petId !== id) : [...prev, id]
    );
  };

  return (
    <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
      {/* Category Select */}
      <PopoverSelect
        label="Category"
        value={input.categoryId}
        options={categoriesList}
        onChange={(value) =>
          setInput((prev) => ({ ...prev, categoryId: value }))
        }
        placeholder="Choose a category"
        isOpen={openStates.category}
        onOpenChange={(open) =>
          setOpenStates((prev) => ({ ...prev, category: open }))
        }
        valueMap={categoryMap}
        disabled={isPending || loading}
        error={errors?.categoryId}
      />

      {/* Supplier Select */}
      <PopoverSelect
        label="Supplier"
        value={input.supplierId}
        options={suppliersList}
        onChange={(value) =>
          setInput((prev) => ({ ...prev, supplierId: value }))
        }
        placeholder="Choose a supplier"
        isOpen={openStates.supplier}
        onOpenChange={(open) =>
          setOpenStates((prev) => ({ ...prev, supplier: open }))
        }
        valueMap={supplierMap}
        disabled={isPending || loading}
        error={errors?.supplierId}
      />

      {/* Pet Select */}
      <div className="flex flex-col gap-1.5 w-full">
        <Label>Pet</Label>
        <div
          className={cn(
            "flex flex-col gap-3",
            petIds.length > 0 && "border rounded-md p-3"
          )}
        >
          <div className="flex flex-wrap gap-3">
            {petIds.map((id) => (
              <div
                className="text-xs px-3 py-0.5 bg-gray-300 w-fit rounded relative flex items-center group"
                key={id}
              >
                {petMap.get(id)}
                <div className="group-hover:flex hidden items-center w-full absolute right-0">
                  <div className="w-full bg-gradient-to-r from-gray-300/50 to-gray-300 h-5" />
                  <button
                    className="px-2 flex-none bg-gray-300 h-full"
                    onClick={() => handleRemovePet(id)}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Popover
            open={openStates.pet}
            onOpenChange={(open) =>
              setOpenStates((prev) => ({ ...prev, pet: open }))
            }
          >
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "w-full bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 text-xs group",
                  errors?.petIds && "border-red-500 hover:border-red-500"
                )}
                variant="outline"
                disabled={isPending || loading}
              >
                <CirclePlus className="size-3.5" />
                Add Pets
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="min-w-[var(--radix-popover-trigger-width)] p-0"
              align="end"
            >
              <Command>
                <CommandInput placeholder="Search pets..." />
                <CommandList>
                  <CommandEmpty>No pets found.</CommandEmpty>
                  <CommandGroup>
                    {petsList.map((pet) => (
                      <CommandItem
                        onSelect={handleChangePet}
                        value={pet.id}
                        key={pet.id}
                      >
                        {pet.name}
                        <Check
                          className={cn(
                            "hidden ml-auto",
                            petIds.includes(pet.id) && "flex"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <MessageInputError error={errors?.petIds} />
        </div>
      </div>
    </div>
  );
};
