import { Label } from "@/components/ui/label";
import React, { Dispatch, MouseEvent, SetStateAction } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckIcon, ChevronDown, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "next/navigation";

export const ProductAction = ({
  errors,
  input,
  disabled,
  handleSelectRole,
  setInput,
  handleSubmit,
}: {
  errors: any;
  input: any;
  disabled: boolean;
  handleSelectRole: (v: string) => void;
  setInput: Dispatch<SetStateAction<any>>;
  handleSubmit: (e: MouseEvent) => void;
}) => {
  const { productId } = useParams();
  return (
    <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5 w-full">
        <Label className="required">Available For</Label>
        <div className="flex flex-col gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "w-full justify-between bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 group overflow-hidden",
                  errors?.role && "border-red-500 hover:border-red-500"
                )}
                variant={"outline"}
              >
                Browse Role
                <ChevronDown />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="min-w-[var(--radix-popover-trigger-width)] p-0 w-auto"
              align="end"
            >
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem onSelect={() => handleSelectRole("basic")}>
                      Agent
                      <CheckIcon
                        className={cn(
                          "hidden ml-auto",
                          input.available.some((i: any) => i === "basic") &&
                            "flex"
                        )}
                      />
                    </CommandItem>
                    <CommandItem onSelect={() => handleSelectRole("petshop")}>
                      Pet Shop
                      <CheckIcon
                        className={cn(
                          "hidden ml-auto",
                          input.available.some((i: any) => i === "petshop") &&
                            "flex"
                        )}
                      />
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleSelectRole("veterinarian")}
                    >
                      Vet Clinic
                      <CheckIcon
                        className={cn(
                          "hidden ml-auto",
                          input.available.some(
                            (i: any) => i === "veterinarian"
                          ) && "flex"
                        )}
                      />
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="flex items-center h-9 text-xs border text-center w-full rounded-md col-span-3 font-medium">
            {input.available.length > 0 ? (
              input.available.map((item: any) => (
                <div
                  key={item}
                  className="w-full border-l h-full first:border-0 flex items-center justify-center capitalize"
                >
                  {item === "basic" && "Agent"}
                  {item === "petshop" && "Pet Shop"}
                  {item === "veterinarian" && "Vet Clinic"}
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 w-full justify-center">
                <AlertCircle className="size-3.5" />
                <p>No Role Selected</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <Label>Status</Label>
        <Select
          value={input.isActive ? "publish" : "draft"}
          onValueChange={(e) =>
            setInput((prev: any) => ({
              ...prev,
              isActive: e === "publish",
            }))
          }
        >
          <SelectTrigger className="bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 w-full">
            <SelectValue placeholder="Select status..." />
          </SelectTrigger>
          <SelectContent
            className="min-w-[var(--radix-popover-trigger-width)] p-0"
            align="end"
          >
            <SelectGroup>
              <SelectItem value="publish">Publish</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSubmit} disabled={disabled}>
        <Save />
        {productId ? "Update" : "Create"}
      </Button>
    </div>
  );
};
