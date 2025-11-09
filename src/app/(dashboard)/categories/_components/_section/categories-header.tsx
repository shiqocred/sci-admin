import { SortTable } from "@/components/sort-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { Plus, RefreshCcw, XCircle } from "lucide-react";
import React from "react";

interface HeaderProps {
  order: string;
  sort: string;
  search: string;
  loading: boolean;
  refetch: () => void;
  setSearch: (v: string | null) => Promise<URLSearchParams>;
  setQuery: any;
}

const filterField = [
  { name: "Name", value: "name" },
  { name: "Slug", value: "slug" },
  { name: "Products", value: "products" },
];

export const Header = ({
  sort,
  order,
  search,
  loading,
  refetch,
  setSearch,
  setQuery,
}: HeaderProps) => {
  const handleClearSearch = () => setSearch(null);
  const handleReload = () => !loading && refetch();

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="w-full flex items-center gap-4 justify-between">
        <h1 className="text-xl font-semibold">Categories</h1>
      </div>
      <div className="flex items-center w-full justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center group">
            <Input
              className="h-8 focus-visible:ring-0 shadow-none w-52 placeholder:text-xs"
              placeholder="Search category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search.length > 0 && (
              <Button
                size={"icon"}
                className="absolute right-2 size-4 hover:bg-gray-200 group-hover:flex hidden"
                variant={"ghost"}
                onClick={handleClearSearch}
              >
                <XCircle className="size-3" />
              </Button>
            )}
          </div>
          <TooltipText value="Reload data">
            <Button
              className="size-8 flex-none disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              size={"icon"}
              onClick={handleReload}
              disabled={loading}
            >
              <RefreshCcw
                className={cn("size-3.5", loading && "animate-spin")}
              />
            </Button>
          </TooltipText>
        </div>
        <div className="flex items-center gap-2">
          <SortTable
            order={order}
            sort={sort}
            setSort={setQuery}
            data={filterField}
          />
          <Button
            className="py-0 h-8 px-3 text-xs font-medium lg:cursor-pointer"
            onClick={() => setQuery({ dialog: "create" })}
            disabled={loading}
          >
            <Plus className="size-3" />
            Add Category
          </Button>
        </div>
      </div>
    </div>
  );
};
