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
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FreeShippingsProps } from "../_api";

export const column = ({
  metaPage,
  handleDelete,
  handleUpdateStatus,
  disabled,
}: {
  metaPage: MetaPageProps;
  disabled: boolean;
  handleDelete: (id: string) => Promise<void>;
  handleUpdateStatus: (
    status: "active" | "expired" | "scheduled",
    id: string
  ) => Promise<void>;
}): ColumnDef<FreeShippingsProps>[] => [
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
    header: "Apply",
    accessorKey: "apply",
  },
  {
    header: "Eligibility",
    accessorKey: "eligibility",
    cell: ({ row }) => <p className="capitalize">{row.original.eligibility}</p>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const freeShipping = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={disabled}>
              <span className="sr-only">Open menu</span>
              {disabled ? (
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
            {freeShipping.status === "active" && (
              <DropdownMenuItem
                className="text-xs"
                onSelect={() =>
                  handleUpdateStatus(freeShipping.status, freeShipping.id)
                }
              >
                <Circle className="size-3.5" />
                Deactivate
              </DropdownMenuItem>
            )}
            {(freeShipping.status === "expired" ||
              freeShipping.status === "scheduled") && (
              <DropdownMenuItem
                className="text-xs"
                onSelect={() =>
                  handleUpdateStatus(freeShipping.status, freeShipping.id)
                }
              >
                <CircleDot className="size-3.5" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-xs" asChild>
              <Link href={`/free-shippings/${freeShipping.id}`}>
                <Edit className="size-3.5" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleDelete(freeShipping.id)}
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
