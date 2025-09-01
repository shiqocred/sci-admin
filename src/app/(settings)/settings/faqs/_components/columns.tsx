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
import {
  ArrowDown,
  ArrowUp,
  MoreHorizontal,
  ReceiptText,
  Trash2,
} from "lucide-react";
import { FaqProps } from "../_api";

export const column = ({
  metaPage,
  setQuery,
  handleMove,
  handleDelete,
}: {
  metaPage: MetaPageProps;
  handleMove: (direction: "up" | "down", id: string) => void;
  handleDelete: (id: string) => Promise<void>;
  setQuery: ({
    faqId,
    dialog,
  }: {
    faqId: string;
    dialog: string;
  }) => Promise<URLSearchParams>;
}): ColumnDef<FaqProps>[] => [
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
    header: () => <div className="text-xs">Question</div>,
    accessorKey: "question",
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const faq = row.original;
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
              onSelect={() => handleMove("up", faq.id)}
              disabled={faq.isFirst}
            >
              <ArrowUp className="size-3.5" />
              Move Up
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs"
              onSelect={() => handleMove("down", faq.id)}
              disabled={faq.isLast}
            >
              <ArrowDown className="size-3.5" />
              Move Down
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs"
              onSelect={() => setQuery({ faqId: faq.id, dialog: "edit" })}
            >
              <ReceiptText className="size-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs text-red-500 focus:text-red-500 focus:bg-red-50 group"
              onSelect={() => handleDelete(faq.id)}
            >
              <Trash2 className="size-3.5 text-red-500 group-focus:text-red-500" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
