"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const Pagination = ({
  setPagination,
  pagination,
  setLimit,
}: {
  pagination: {
    limit: number;
    current: number;
    last: number;
    from: number;
    total: number;
    perPage: number;
  };
  setPagination: any;
  setLimit: any;
}) => {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex gap-3 items-center">
        <p>Show</p>
        <Select
          value={pagination.limit.toString()}
          onValueChange={(v) => setLimit(v)}
        >
          <SelectTrigger className="w-fit h-8 border-0 bg-transparent shadow-none p-0 text-xs font-medium focus:ring-0 focus-visible:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <p>entries</p>
      </div>
      <div className="flex items-center gap-3"></div>
      <div className="flex gap-5 items-center text-sm">
        <div className="flex items-center gap-1">
          <span>Page {pagination.current.toLocaleString()}</span>
          <span>of {pagination.last.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="size-8"
            size={"icon"}
            onClick={() => {
              setPagination((prev: number) => prev - 1);
            }}
            disabled={pagination.current === 1}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            className="size-8"
            size={"icon"}
            onClick={() => {
              setPagination((prev: number) => prev + 1);
            }}
            disabled={pagination.current === pagination.last}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
