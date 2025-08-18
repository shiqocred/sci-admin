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
import {
  Circle,
  CircleDot,
  Edit,
  ImageIcon,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { cn, sizesImage } from "@/lib/utils";
import { PromoProps } from "../_api";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const column = ({
  metaPage,
  handleDelete,
  handleUpdateStatus,
}: {
  metaPage: MetaPageProps;
  handleDelete: (id: string) => Promise<void>;
  handleUpdateStatus: (status: any, id: string) => void;
}): ColumnDef<PromoProps>[] => [
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
      const promo = row.original;

      return (
        <div className="size-10 relative rounded overflow-hidden flex items-center justify-center border">
          {promo.image ? (
            <Image
              src={promo.image}
              alt={promo.name}
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
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          className={cn(
            "capitalize",
            status === "active" && "bg-green-200 text-black font-normal",
            status === "scheduled" && "bg-yellow-200 text-black font-normal",
            status === "expired" && "bg-gray-200 text-black font-normal"
          )}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    header: () => <div className="">Product</div>,
    accessorKey: "totalMount",
    cell: ({ row }) => (
      <div className="text-wrap">{row.original.totalMount}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const promo = row.original;
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
            {(promo.status === "active" || promo.status === "scheduled") && (
              <DropdownMenuItem
                className="text-xs"
                onSelect={() => handleUpdateStatus(promo.status, promo.id)}
              >
                <Circle className="size-3.5" />
                Deactivate
              </DropdownMenuItem>
            )}
            {promo.status === "expired" && (
              <DropdownMenuItem
                className="text-xs"
                onSelect={() => handleUpdateStatus(promo.status, promo.id)}
              >
                <CircleDot className="size-3.5" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-xs" asChild>
              <Link href={`/promos/${promo.id}`}>
                <Edit className="size-3.5" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleDelete(promo.id)}
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
