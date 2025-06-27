"use client";

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React from "react";
import { column } from "./columns";
import {
  ArrowDownUp,
  Check,
  Download,
  Plus,
  PlusCircle,
  Share,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/data-table";

export const Client = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex items-center gap-4 justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md overflow-hidden border">
            <Button
              className="size-8 flex-none rounded-none"
              variant={"ghost"}
              size={"icon"}
            >
              <Share className="size-3.5" />
            </Button>
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-8"
            />
            <Button
              className="size-8 flex-none rounded-none"
              variant={"ghost"}
              size={"icon"}
            >
              <Download className="size-3.5" />
            </Button>
          </div>
          <Button
            className="py-0 h-8 px-3 text-xs font-medium lg:cursor-pointer"
            asChild
          >
            <Link href={"/products/new"}>
              <Plus className="size-3" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center w-full justify-between gap-2">
          <div className="flex items-center gap-2">
            <Popover>
              <div className="flex items-center border border-dashed rounded-md h-8">
                <PopoverTrigger asChild>
                  <Button
                    variant={"ghost"}
                    className="text-xs font-normal h-full py-0 px-3"
                  >
                    <PlusCircle className="size-3" />
                    Status
                  </Button>
                </PopoverTrigger>
              </div>
              <PopoverContent className="p-0 w-fit" align="start">
                <Command>
                  <CommandInput placeholder="Status" classNameWrap="h-8" />
                  <CommandList>
                    <CommandGroup>
                      <CommandItem>
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary bg-primary"
                            // isSelected
                            //   ? "bg-primary text-primary-foreground"
                            //   : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <Check className="text-primary-foreground" />
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Popover>
              <div className="flex items-center border border-dashed rounded-md h-8">
                <PopoverTrigger asChild>
                  <Button
                    variant={"ghost"}
                    className="text-xs font-medium h-full py-0 px-3"
                  >
                    <PlusCircle className="size-3" />
                    Category
                  </Button>
                </PopoverTrigger>
              </div>
              <PopoverContent className="p-0 w-fit" align="start">
                <Command>
                  <CommandInput placeholder="Status" classNameWrap="h-8" />
                  <CommandList>
                    <CommandGroup>
                      <CommandItem>
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary bg-primary"
                            // isSelected
                            //   ? "bg-primary text-primary-foreground"
                            //   : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <Check className="text-primary-foreground" />
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center border border-dashed rounded-md h-8 hover:bg-gray-100 transition">
                  <Button
                    variant={"ghost"}
                    className="text-xs font-medium h-full py-0 px-3 hover:bg-transparent"
                  >
                    <PlusCircle className="size-3" />
                    Supplier
                  </Button>
                  <Separator
                    orientation="vertical"
                    className="data-[orientation=vertical]:h-full"
                  />
                  <div className="size-5 text-xs bg-gray-200 font-medium rounded-sm mx-2 flex items-center justify-center">
                    1
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-fit" align="start">
                <Command>
                  <CommandInput placeholder="Status" classNameWrap="h-8" />
                  <CommandList>
                    <CommandGroup>
                      <CommandItem>
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary bg-primary"
                            // isSelected
                            //   ? "bg-primary text-primary-foreground"
                            //   : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <Check className="text-primary-foreground" />
                        </div>
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem className="justify-center text-center">
                        Clear filters
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              className="text-xs font-normal h-8 py-0 px-3"
              variant={"ghost"}
            >
              Reset
              <XCircle />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              className="h-8 focus-visible:ring-0 shadow-none w-52 placeholder:text-xs"
              placeholder="Search product..."
            />
            <Button
              className="size-8 flex-none"
              variant={"outline"}
              size={"icon"}
            >
              <ArrowDownUp className="size-3.5" />
            </Button>
          </div>
        </div>
        <DataTable data={[]} columns={column} />
      </div>
    </div>
  );
};
