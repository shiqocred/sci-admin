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
import { ProductGrouped } from "../_api";
import { Badge } from "@/components/ui/badge";

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
}): ColumnDef<ProductGrouped>[] => [
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
    header: () => <div className="text-xs">SKU</div>,
    accessorKey: "sku",
    cell: ({ row }) => {
      const product = row.original;
      if (product.default_variant)
        return <p className="font-semibold">{product.default_variant.sku}</p>;

      if (product.variants)
        return (
          <div className="flex flex-col gap-0.5 font-semibold">
            {product.variants.map((variant) => (
              <p key={variant.sku}>{variant.sku}</p>
            ))}
          </div>
        );

      return null;
    },
  },
  {
    header: () => <div className="text-xs text-wrap">Product Name</div>,
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
      if (product.default_variant)
        return (
          <p>
            <span className="font-semibold">
              {parseFloat(
                product.default_variant.stock ?? "0"
              ).toLocaleString()}
            </span>{" "}
            in stock
          </p>
        );

      if (product.variants)
        return (
          <div className="flex flex-col gap-0.5">
            {product.variants.map((variant) => (
              <p key={variant.sku}>
                <span className="font-semibold">
                  {parseFloat(variant.stock ?? "0").toLocaleString()}
                </span>{" "}
                in stock for{" "}
                <span className="font-semibold">{variant.name}</span>
              </p>
            ))}
          </div>
        );

      return null;
    },
  },
  {
    header: () => <div className="text-xs">Available for</div>,
    accessorKey: "available",
    cell: ({ row }) => {
      const product = row.original;
      if (product.available.length === 3)
        return (
          <Badge className="capitalize rounded-full font-normal">
            All Customer
          </Badge>
        );

      return (
        <div className="flex items-center gap-0.5">
          {product.available.map((role) => (
            <Badge key={role} className="capitalize rounded-full font-normal">
              {role === "BASIC" && "Pet Owner"}
              {role === "PETSHOP" && "Pet Shop"}
              {role === "VETERINARIAN" && "Pet Clinic"}
            </Badge>
          ))}
        </div>
      );
    },
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
