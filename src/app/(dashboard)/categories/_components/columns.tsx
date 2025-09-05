import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { MetaPageProps } from "@/lib/pagination";

import { ColumnDef } from "@tanstack/react-table";
import { Edit, ImageIcon, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";
import { sizesImage } from "@/lib/utils";

export const column = ({
  metaPage,
  setQuery,
  handleDelete,
  isLoading,
}: {
  metaPage: MetaPageProps;
  setQuery: any;
  handleDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}): ColumnDef<any>[] => [
  {
    header: () => <div className="text-center">No</div>,
    id: "id",
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(metaPage.from + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    header: "",
    accessorKey: "image",
    cell: ({ row }) => {
      const category = row.original;

      return (
        <div className="size-10 relative rounded overflow-hidden flex items-center justify-center border">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes={sizesImage}
              className="object-cover"
            />
          ) : (
            <ImageIcon className="size-5" />
          )}
        </div>
      );
    },
  },
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Slug",
    accessorKey: "slug",
  },
  {
    header: () => <div className="text-center">Products</div>,
    accessorKey: "totalProducts",
    cell: ({ row }) => (
      <div className="text-center">
        {(parseFloat(row.original.totalProducts) ?? 0).toLocaleString()}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const category = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              disabled={isLoading}
            >
              <span className="sr-only">Open menu</span>
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <MoreHorizontal />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs font-semibold">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs"
              onSelect={() =>
                setQuery({ dialog: "edit", categoryId: category.id })
              }
            >
              <Edit className="size-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleDelete(category.id)}
              className="text-xs text-red-400 focus:text-red-500 group"
            >
              <Trash2 className="size-3.5 text-red-400 group-focus:text-red-500" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
