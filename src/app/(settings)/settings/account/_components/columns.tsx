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
import { ColumnDef } from "@tanstack/react-table";
import { LockIcon, MoreHorizontal, ReceiptText } from "lucide-react";
import { AdminProps } from "../_api";

export const column = ({
  metaPage,
  setQuery,
}: {
  metaPage: MetaPageProps;
  setQuery: ({
    adminId,
    dialog,
  }: {
    adminId: string;
    dialog: string;
  }) => Promise<URLSearchParams>;
}): ColumnDef<AdminProps>[] => [
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
    header: () => <div className="text-xs">Name</div>,
    accessorKey: "name",
  },
  {
    header: () => <div className="text-xs">Email</div>,
    accessorKey: "email",
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const admin = row.original;
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
              onSelect={() => setQuery({ adminId: admin.id, dialog: "edit" })}
            >
              <ReceiptText className="size-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs"
              onSelect={() =>
                setQuery({ adminId: admin.id, dialog: "password" })
              }
            >
              <LockIcon className="size-3.5" />
              Change Password
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
