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
  ArrowRight,
  BadgeCheck,
  CheckCircle,
  Clock,
  IdCard,
  ImageIcon,
  Minus,
  MoreHorizontal,
  ReceiptText,
  Trash2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { cn, formatRupiah, sizesImage } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import Link from "next/link";

export const column = ({
  metaPage,
  setQuery,
  handleVerify,
  handleDelete,
}: {
  metaPage: MetaPageProps;
  setQuery: any;
  handleVerify: (id: string) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
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
      const status_role = customer.status_role;
      const role = customer.role;
      const newRole = customer.newRole;
      return (
        <div className="text-center w-fit font-medium flex gap-2 items-center">
          <p
            className={cn(
              "px-2 py-0.5 rounded-full",
              role === "Basic"
                ? "bg-emerald-100"
                : role === "Pet Shop"
                  ? "bg-violet-100"
                  : "bg-amber-100"
            )}
          >
            {role === "Basic" && "Agent"}
            {role === "Veterinarian" && "Vet Clinic"}
            {role === "Pet Shop" && "Pet Shop"}
          </p>
          <div className="flex gap-0.5 items-center">
            {(status_role === 1 || status_role === 2) && (
              <Minus className="size-3 text-gray-500" />
            )}
            {status_role === 1 && (
              <TooltipText value={"Pending"}>
                <Clock className="size-3 text-yellow-500" />
              </TooltipText>
            )}
            {status_role === 2 && (
              <TooltipText value={"Rejected"}>
                <XCircle className="size-3 text-red-500" />
              </TooltipText>
            )}
            {(status_role === 1 || status_role === 2) && (
              <ArrowRight className="size-3 text-gray-500" />
            )}
          </div>
          {role !== newRole && (
            <p
              className={cn(
                "px-2 py-0.5 rounded-full",
                newRole === "Basic"
                  ? "bg-emerald-100"
                  : newRole === "Pet Shop"
                    ? "bg-violet-100"
                    : "bg-amber-100"
              )}
            >
              {newRole === "Basic" && "Agent"}
              {newRole === "Veterinarian" && "Vet Clinic"}
              {newRole === "Pet Shop" && "Pet Shop"}
            </p>
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
              onSelect={() => handleVerify(customer.id)}
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
            <DropdownMenuItem className="text-xs" asChild>
              <Link href={`/customers/${customer.id}`}>
                <ReceiptText className="size-3.5" />
                Detail
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => handleDelete(customer.id)}
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
