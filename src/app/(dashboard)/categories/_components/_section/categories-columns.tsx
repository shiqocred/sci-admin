import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, ImageIcon, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";

import { MetaPageProps } from "@/lib/pagination";
import { sizesImage } from "@/lib/utils";
import { CategoriesListProps } from "../../_api";

interface ColumnOptions {
  metaPage: MetaPageProps;
  setQuery: (query: Record<string, any>) => void;
  handleDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

const ImageCell = ({ image, name }: { image?: string; name: string }) => (
  <div className="relative size-10 rounded border overflow-hidden flex items-center justify-center">
    {image ? (
      <Image
        src={image}
        alt={name}
        fill
        sizes={sizesImage}
        className="object-cover"
      />
    ) : (
      <ImageIcon className="size-5 text-muted-foreground" />
    )}
  </div>
);

const ActionsCell = ({
  id,
  isLoading,
  setQuery,
  handleDelete,
}: {
  id: string;
  isLoading: boolean;
  setQuery: (query: Record<string, any>) => void;
  handleDelete: (id: string) => Promise<void>;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" disabled={isLoading}>
        <span className="sr-only">Open menu</span>
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <MoreHorizontal className="size-4" />
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
        onSelect={() => setQuery({ dialog: "edit", categoryId: id })}
      >
        <Edit className="size-3.5 mr-2" />
        Edit
      </DropdownMenuItem>
      <DropdownMenuItem
        className="text-xs text-red-500 focus:text-red-600 group"
        onSelect={() => handleDelete(id)}
      >
        <Trash2 className="size-3.5 mr-2 text-red-500 group-focus:text-red-600" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const column = ({
  metaPage,
  setQuery,
  handleDelete,
  isLoading,
}: ColumnOptions): ColumnDef<CategoriesListProps>[] => [
  {
    id: "id",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(metaPage.from + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "image",
    header: "",
    cell: ({ row }) => (
      <ImageCell image={row.original.image ?? ""} name={row.original.name} />
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "totalProducts",
    header: () => <div className="text-center">Products</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {Number(row.original.totalProducts || 0).toLocaleString()}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <ActionsCell
        id={row.original.id}
        isLoading={isLoading}
        setQuery={setQuery}
        handleDelete={handleDelete}
      />
    ),
  },
];
