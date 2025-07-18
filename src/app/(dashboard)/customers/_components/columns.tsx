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
  Clock,
  Edit,
  IdCard,
  ImageIcon,
  MoreHorizontal,
  Trash2,
  XCircle,
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
      const customer = row.original;
      return (
        <div className="text-center w-fit font-medium flex gap-2 items-center">
          <p
            className={cn(
              "px-2 py-0.5 rounded-full",
              customer.role === "Basic"
                ? "bg-emerald-100"
                : customer.role === "Pet Shop"
                  ? "bg-violet-100"
                  : "bg-amber-100"
            )}
          >
            {customer.role}
          </p>
          {customer.status_role === 1 && (
            <TooltipText value={"Pending"}>
              <Clock className="size-3 text-gray-500" />
            </TooltipText>
          )}
          {customer.status_role === 2 && (
            <TooltipText value={"Rejected"}>
              <XCircle className="size-3 text-red-500" />
            </TooltipText>
          )}
        </div>
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
      const customer = row.original;
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
              disabled={customer.isVerified}
              className="text-xs"
              onSelect={() => {}}
            >
              <BadgeCheck className="size-3.5" />
              Mark email as verified
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs"
              disabled={customer.status_role !== 1}
              onSelect={() =>
                setQuery({ dialog: "review", customerId: customer.id })
              }
            >
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
