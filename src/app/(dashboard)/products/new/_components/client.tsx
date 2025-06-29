"use client";

import { LabelInput } from "@/components/label-input";
import { RichInput } from "@/components/rich-editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, Edit3, PlusCircle, Trash2 } from "lucide-react";
import React, { useState } from "react";

export const Client = () => {
  const [isVariant, setIsVariant] = useState<boolean | "indeterminate">(false);
  return (
    <div className="w-full flex flex-col gap-6 pb-20">
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
          <div className="w-full flex items-center gap-2 px-3 py-5 bg-gray-100 border rounded-lg border-gray-300">
            <Label>
              <Checkbox
                className="border-gray-400"
                checked={isVariant}
                onCheckedChange={setIsVariant}
              />
              <span>Product with variant</span>
            </Label>
          </div>
          {isVariant ? (
            <>
              <div className="bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col px-3 py-5 gap-3">
                <h5 className="font-bold underline underline-offset-4 text-sm">
                  Variants
                </h5>
                <div className="flex flex-col overflow-hidden">
                  <div className="border border-gray-300 rounded-t-md w-full border-b-0">
                    <div className="p-5 border-b border-gray-300 flex flex-col gap-3">
                      <LabelInput
                        label="Option name"
                        placeholder="e.g. Weight"
                      />
                      <div className="flex flex-col gap-1.5">
                        <Label>Option values</Label>
                        <div className="flex flex-col gap-2">
                          <div className="relative flex items-center">
                            <Input
                              placeholder="e.g. 30L"
                              className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none placeholder:text-xs"
                            />
                            <Button
                              size={"icon"}
                              className="size-7 absolute right-1 hover:bg-red-100 hover:text-red-600"
                              variant={"ghost"}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                          <div className="relative flex items-center">
                            <Input
                              placeholder="Add another value"
                              className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none placeholder:text-xs"
                            />
                            <Button
                              size={"icon"}
                              className="size-7 absolute right-1 hover:bg-red-100 hover:text-red-600"
                              variant={"ghost"}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <Button
                              className="px-3 py-0.5 text-xs h-7 text-red-500 hover:text-red-600 hover:bg-red-100 shadow-none border-red-300"
                              variant={"outline"}
                            >
                              Delete
                            </Button>
                            <Button className="px-3 py-0.5 text-xs h-7">
                              Done
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={"ghost"}
                      className="p-5 h-auto justify-between group w-full rounded-none"
                    >
                      <div className="flex flex-col gap-3">
                        <Input
                          value={"lsds / sdsd"}
                          className="border-none shadow-none disabled:opacity-100 px-0 h-7 font-semibold"
                          disabled
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          {Array.from({ length: 5 }, (_, i) => (
                            <p
                              key={i}
                              className="text-xs py-0.5 font-medium px-2 bg-gray-300 rounded-md"
                            >
                              Gram
                            </p>
                          ))}
                        </div>
                      </div>
                      <div className="mr-5 group-hover:block hidden text-gray-400">
                        <Edit3 />
                      </div>
                    </Button>
                  </div>
                  <Button className="rounded-t-none text-xs justify-start">
                    <PlusCircle className="size-3.5" />
                    Add Option
                  </Button>
                </div>
              </div>
              <div className="bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col px-3 py-5 gap-3">
                <h5 className="font-bold underline underline-offset-4 text-sm">
                  Pricing
                </h5>
                <div className="flex flex-col border rounded-md">
                  <div className="flex flex-col p-3">
                    <Input
                      value={"lsds / sdsd"}
                      className="border-none shadow-none disabled:opacity-100 px-0 h-7 font-semibold"
                      disabled
                    />
                    <Separator className="my-2" />
                    <div className="flex gap-3">
                      <LabelInput label="Price" type="number" />
                      <LabelInput label="Compare-at price" type="number" />
                      <LabelInput
                        label="Stock"
                        type="number"
                        classContainer="w-52"
                      />
                      <div className="flex flex-col gap-1.5 w-52">
                        <Label>Weight</Label>
                        <div className="flex items-center relative">
                          <Input className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none" />
                          <p className="absolute right-3 text-xs py-0.5 font-medium px-2 bg-gray-300 rounded-md">
                            Gram
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex flex-col p-3">
                    <Input
                      value={"lsds / sdsd"}
                      className="border-none shadow-none disabled:opacity-100 px-0 h-7 font-semibold"
                      disabled
                    />
                    <Separator className="my-2" />
                    <div className="flex gap-3">
                      <LabelInput label="Price" type="number" />
                      <LabelInput label="Compare-at price" type="number" />
                      <LabelInput
                        label="Stock"
                        type="number"
                        classContainer="w-52"
                      />
                      <div className="flex flex-col gap-1.5 w-52">
                        <Label>Weight</Label>
                        <div className="flex items-center relative">
                          <Input className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none" />
                          <p className="absolute right-3 text-xs py-0.5 font-medium px-2 bg-gray-300 rounded-md">
                            Gram
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col">
              <div className="px-3 py-5 flex flex-col gap-3">
                <h5 className="font-bold underline underline-offset-4 text-sm">
                  Pricing
                </h5>
                <div className="flex flex-col gap-3">
                  <LabelInput label="Price" type="number" />
                  <LabelInput label="Compare-at price" type="number" />
                </div>
              </div>
              <Separator />
              <div className="px-3 py-5 flex flex-col gap-3">
                <h5 className="font-bold underline underline-offset-4 text-sm">
                  Shipping
                </h5>
                <div className="flex flex-col gap-1.5 w-full">
                  <Label>Weight</Label>
                  <div className="flex items-center relative">
                    <Input className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none" />
                    <p className="absolute right-3 text-xs py-0.5 font-medium px-2 bg-gray-300 rounded-md">
                      Gram
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-span-1 w-full relative">
          <div className="flex flex-col gap-3 sticky top-3">
            <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5 w-full">
                <Label>Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger className="bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 w-full">
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent
                    className="min-w-[var(--radix-popover-trigger-width)] p-0"
                    align="end"
                  >
                    <SelectGroup>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
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
              <div className="flex flex-col gap-1.5 w-full">
                <Label>Pets</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="w-full justify-between bg-transparent border-gray-300 shadow-none hover:bg-gray-100 hover:border-gray-400 group"
                      variant={"outline"}
                    >
                      <span className="font-normal text-gray-500">
                        Choose a Pets
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
    </div>
  );
};
