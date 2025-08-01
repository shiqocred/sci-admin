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
  Check,
  Circle,
  CircleDot,
  Clipboard,
  Edit,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { MouseEvent } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const column = ({
  metaPage,
  copied,
  handleCopy,
  handleDelete,
  handleUpdateStatus,
  disabled,
}: {
  metaPage: MetaPageProps;
  copied: boolean;
  disabled: boolean;
  handleDelete: (id: string) => Promise<void>;
  handleCopy: (e: MouseEvent, name: string) => void;
  handleUpdateStatus: (
    status: "active" | "expired" | "scheduled",
    id: string
  ) => Promise<void>;
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
    header: "Voucher",
    accessorKey: "code",
    cell: ({ row }) => {
      const discount = row.original;
      return (
        <div className="flex items-center gap-2">
          <p>{discount.code}</p>
          <Button
            variant={"ghost"}
            size={"icon"}
            className="size-5 hover:bg-gray-200 disabled:opacity-100"
            onClick={(e) => handleCopy(e, discount.code)}
            disabled={copied}
          >
            {copied ? (
              <Check className="size-3.5 text-gray-500" />
            ) : (
              <Clipboard className="size-3.5 text-gray-500" />
            )}
          </Button>
        </div>
      );
    },
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
    header: "Value",
    accessorKey: "applyType",
    cell: ({ row }) => {
      const discount = row.original;
      return (
        <p>
          {discount.valueType === "percentage"
            ? `${discount.value}%`
            : formatRupiah(discount.value)}{" "}
          off{" "}
          {!discount.applyType ? (
            "All Products"
          ) : (
            <>
              {discount.totalApply}{" "}
              <span className="capitalize">{discount.applyType}</span>
            </>
          )}
        </p>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const discount = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={disabled}>
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
            {discount.status === "active" && (
              <DropdownMenuItem
                className="text-xs"
                onSelect={() =>
                  handleUpdateStatus(discount.status, discount.id)
                }
              >
                <Circle className="size-3.5" />
                Deactivate
              </DropdownMenuItem>
            )}
            {(discount.status === "expired" ||
              discount.status === "scheduled") && (
              <DropdownMenuItem
                className="text-xs"
                onSelect={() =>
                  handleUpdateStatus(discount.status, discount.id)
                }
              >
                <CircleDot className="size-3.5" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-xs" asChild>
              <Link href={`/discounts/${discount.id}`}>
                <Edit className="size-3.5" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleDelete(discount.id)}
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
