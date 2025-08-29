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
import { cn, formatRupiah, pronoun } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ReceiptText } from "lucide-react";
import { OrderResponse } from "../_api";
import Link from "next/link";

export const column = ({
  metaPage,
}: {
  metaPage: MetaPageProps;
}): ColumnDef<OrderResponse>[] => [
  {
    header: () => <div className="text-center">No</div>,
    id: `${metaPage.from}-id`,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(metaPage.from + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    header: () => <div className="text-xs">OrderId</div>,
    accessorKey: "id",
    cell: ({ row }) => <p className="font-semibold">#{row.original.id}</p>,
  },
  {
    header: () => <div className="text-xs">Date</div>,
    accessorKey: "date",
  },
  {
    header: () => <div className="text-xs">Customer</div>,
    accessorKey: "user_name",
  },
  {
    header: () => <div className="text-xs">Total Price</div>,
    accessorKey: "total_price",
    cell: ({ row }) => formatRupiah(row.original.total_price),
  },
  {
    header: () => <div className="text-xs">Status</div>,
    accessorKey: "status",
    cell: ({ row }) => (
      <div>
        <p
          className={cn(
            "px-3 py-0.5 w-fit rounded-lg font-medium capitalize",
            row.original.status === "waiting payment" && "bg-yellow-200",
            row.original.status === "processed" && "bg-blue-200",
            row.original.status === "shipping" && "bg-yellow-200",
            row.original.status === "delivered" && "bg-green-200",
            row.original.status === "cancelled" && "bg-red-200",
            row.original.status === "expired" && "bg-orange-200"
          )}
        >
          {row.original.status}
        </p>
      </div>
    ),
  },
  {
    header: () => <div className="text-xs">Products</div>,
    accessorKey: "total_item",
    cell: ({ row }) =>
      `${(row.original.total_item ?? 0).toLocaleString()} item${pronoun(row.original.total_item)}`,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const order = row.original;
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
            <DropdownMenuItem className="text-xs" asChild>
              <Link href={`/orders/${order.id}`}>
                <ReceiptText className="size-3.5" />
                Detail
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
