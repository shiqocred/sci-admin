import { LabelInput } from "@/components/label-input";
import { MessageInputError } from "@/components/message-input-error";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckIcon, ChevronDown } from "lucide-react";
import React from "react";

export const ProductCore = ({
  input,
  handleOnChange,
  disabled,
  setImagesProduct,
  imageOld,
  setImageOld,
  handleSelectRole,
  errors,
}: {
  input: any;
  handleOnChange: any;
  disabled: boolean;
  setImagesProduct: React.Dispatch<React.SetStateAction<File[] | null>>;
  imageOld?: string[];
  setImageOld?: React.Dispatch<React.SetStateAction<string[]>>;
  handleSelectRole: (value: string) => void;
  errors: any;
}) => {
  return (
    <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
      <div className="flex flex-col w-full gap-1.5">
        <LabelInput
          label="Title"
          placeholder="e.g. Obat Kutu Kucing"
          id="title"
          className={cn(errors?.title && "border-red-500 hover:border-red-500")}
          value={input.title}
          onChange={(e) => handleOnChange(e.target.id, e.target.value)}
          disabled={disabled}
        />
        <MessageInputError error={errors?.title} />
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <Label>Images</Label>
        <FileUpload
          onChange={(e) => setImagesProduct(e as File[])}
          imageOld={imageOld}
          setImageOld={(e: any) => setImageOld?.(e)}
        />
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <Label>Available For</Label>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center h-9 text-xs border text-center w-full rounded-md col-span-3 font-medium">
            {input.available.length > 0 ? (
              input.available.map((item: any) => (
                <div
                  key={item}
                  className="w-full border-l h-full first:border-0 flex items-center justify-center capitalize"
                >
                  {item === "basic" && "Pet Owner"}
                  {item === "petshop" && "Pet Shop"}
                  {item === "veterinarian" && "Pet Clinic"}
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 w-full justify-center">
                <AlertCircle className="size-3.5" />
                <p>No Role Selected</p>
              </div>
            )}
          </div>
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
                      Pet Owner
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
                      Pet Clinic
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
        </div>
      </div>
    </div>
  );
};
