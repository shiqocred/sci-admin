import { SortTable } from "@/components/sort-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { Plus, RefreshCcw, XCircle } from "lucide-react";
import Link from "next/link";
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

const filterField = [{ name: "Name", value: "name" }];

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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Banners</h1>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Input
              className="h-8 w-52 shadow-none placeholder:text-xs focus-visible:ring-0"
              placeholder="Search banner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleClearSearch}
                className="absolute right-2 hidden size-4 hover:bg-gray-200 group-hover:flex"
              >
                <XCircle className="size-3" />
              </Button>
            )}
          </div>

          <TooltipText value="Reload data">
            <Button
              variant="outline"
              size="icon"
              onClick={handleReload}
              disabled={loading}
              className="size-8 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-100"
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
            asChild
            disabled={loading}
            className="h-8 px-3 py-0 text-xs font-medium lg:cursor-pointer"
          >
            <Link href="/banners/create">
              <Plus className="size-3" />
              Add Banners
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
