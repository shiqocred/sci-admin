"use client";

import { LabelInput } from "@/components/label-input";
import { RichInput } from "@/components/rich-editor";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown } from "lucide-react";
import React from "react";

export const Client = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex items-center gap-4">
        <h1 className="text-xl font-semibold">Add Products</h1>
      </div>
      <div className="w-full grid grid-cols-3 gap-6">
        <div className="col-span-2 w-full flex flex-col gap-4">
          <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
            <LabelInput label="Title" placeholder="e.g. Obat Kutu Kucing" />
            <div className="flex flex-col gap-1.5 w-full">
              <Label>Images</Label>
              <Button
                className="w-full h-28 bg-transparent border-gray-300 border-dashed hover:bg-gray-100 hover:border-gray-400 shadow-none"
                variant={"outline"}
              >
                Upload Gambar
              </Button>
            </div>
          </div>
          <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 w-full">
              <Label>Description</Label>
              <Textarea className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none min-h-24" />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <Label>Indication</Label>
              <RichInput />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <Label>Dosage & Usage</Label>
              <RichInput />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <Label>Storage Instruction</Label>
              <Textarea className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none min-h-24" />
            </div>
            <LabelInput label="Packaging" />
            <LabelInput label="Registration number" />
          </div>
          <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
            <LabelInput label="Price" type="number" />
            <LabelInput label="Compare-at price" type="number" />
          </div>
          <div className="bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col">
            <div className="px-3 py-5">
              <LabelInput label="Weight" type="number" />
            </div>
            <Separator />
            <div className="px-3 py-5 flex items-center gap-3">
              <LabelInput label="Length" type="number" />
              <LabelInput label="Width" type="number" />
              <LabelInput label="Height" type="number" />
            </div>
          </div>
        </div>
        <div className="col-span-1 w-full relative">
          <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3 sticky top-3">
            <div className="flex flex-col gap-1.5 w-full">
              <Label>Category</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="w-full justify-between bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 group"
                    variant={"outline"}
                  >
                    <span className="font-normal text-gray-500">
                      Choose a category
                    </span>
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
                      <CommandEmpty />
                      <CommandGroup>
                        <CommandItem>Categori 1</CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <Label>Supplier</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="w-full justify-between bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 group"
                    variant={"outline"}
                  >
                    <span className="font-normal text-gray-500">
                      Choose a supplier
                    </span>
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
                      <CommandEmpty />
                      <CommandGroup>
                        <CommandItem>Categori 1</CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
