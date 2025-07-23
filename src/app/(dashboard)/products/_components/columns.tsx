import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MetaPageProps } from "@/lib/pagination";
import { cn, sizesImage } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import {
  CircleDot,
  Edit,
  ImageIcon,
  MoreHorizontal,
  ReceiptText,
  Trash2,
} from "lucide-react";
import Image from "next/image";

export const column = ({
  metaPage,
  handleDelete,
  handleChangeStatus,
  handleMove,
}: {
  metaPage: MetaPageProps;
  handleDelete: (id: string) => Promise<void>;
  handleChangeStatus: (id: string) => Promise<void>;
  handleMove: (id: string, type: "detail" | "edit") => void;
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
      const product = row.original;

      return (
        <div className="size-10 relative rounded overflow-hidden flex items-center justify-center border">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
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
    header: () => <div className="text-xs">Product</div>,
    accessorKey: "name",
  },
  {
    header: () => <div className="text-xs">Status</div>,
    accessorKey: "status",
    cell: ({ row }) => (
      <div>
        <p
          className={cn(
            "px-3 py-0.5 w-fit rounded-lg font-medium",
            row.original.status ? "bg-green-200" : "bg-gray-200"
          )}
        >
          {row.original.status ? "Publish" : "Draft"}
        </p>
      </div>
    ),
  },
  {
    header: () => <div className="text-xs">Stock</div>,
    accessorKey: "stock",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <p>
          {product.stock} in stock for {product.variantCount} variant
          {product.variantCount > 1 ? "s" : ""}
        </p>
      );
    },
  },
  {
    header: () => <div className="text-xs">Category</div>,
    accessorKey: "categoryName",
  },
  {
    header: () => <div className="text-xs">Suplier</div>,
    accessorKey: "supplierName",
  },
  {
    header: () => <div className="text-xs">Pets</div>,
    accessorKey: "petCount",
    cell: ({ row }) => (
      <p>
        {row.original.petCount} Pet{row.original.petCount > 1 ? "s" : ""}
      </p>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs font-semibold">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs"
              onSelect={() => handleChangeStatus(product.id)}
            >
              <CircleDot className="size-3.5" />
              Set {product.status ? "draft" : "publish"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs"
              onSelect={() => handleMove(product.id, "detail")}
            >
              <ReceiptText className="size-3.5" />
              Detail
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs"
              onSelect={() => handleMove(product.id, "edit")}
            >
              <Edit className="size-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleDelete(product.id)}
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
