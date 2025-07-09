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
  BadgeCheck,
  CheckCircle,
  Edit,
  IdCard,
  ImageIcon,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { cn, formatRupiah, sizesImage } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";

export const column = ({
  metaPage,
  setQuery,
}: {
  metaPage: MetaPageProps;
  setQuery: any;
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
      const customer = row.original;

      return (
        <div className="size-10 relative rounded overflow-hidden flex items-center justify-center border">
          {customer.image ? (
            <Image
              src={customer.image}
              alt={customer.name}
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
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="flex items-center gap-2">
          <p>{customer.email}</p>
          {customer.isVerified && (
            <TooltipText value={"Email verified"}>
              <CheckCircle className="size-3 text-green-600" />
            </TooltipText>
          )}
        </div>
      );
    },
  },
  {
    header: "Role",
    accessorKey: "role",
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <p
          className={cn(
            "text-center w-fit px-2 py-0.5 font-medium rounded",
            role === "Basic"
              ? "bg-emerald-200"
              : role === "Pet Shop"
                ? "bg-violet-200"
                : "bg-amber-200"
          )}
        >
          {role}
        </p>
      );
    },
  },
  {
    header: () => <div className="text-center">Orders</div>,
    accessorKey: "orders",
    cell: ({ row }) => (
      <div className="text-center">
        {(parseFloat(row.original.orders) ?? 0).toLocaleString()}
      </div>
    ),
  },
  {
    header: () => <div className="text-center">Amount spent</div>,
    accessorKey: "amountSpent",
    cell: ({ row }) => (
      <div className="text-center">
        {formatRupiah(row.original.amountSpent ?? 0)}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const supplier = row.original;
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
            <DropdownMenuItem className="text-xs" onSelect={() => {}}>
              <BadgeCheck className="size-3.5" />
              Mark email as verified
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onSelect={() => {}}>
              <IdCard className="size-3.5" />
              Review upgrade role
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs" onSelect={() => {}}>
              <Edit className="size-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {}}
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
