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
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Circle, CircleDot, MoreHorizontal, ReceiptText } from "lucide-react";
import { TestimoniesResponse } from "../_api";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";
import { Badge } from "@/components/ui/badge";

export const column = ({
  metaPage,
  setQuery,
  handleUpdate,
}: {
  metaPage: MetaPageProps;
  handleUpdate: (id?: string, status?: boolean) => void;
  setQuery: ({
    reviewId,
    dialog,
  }: {
    reviewId: string;
    dialog: boolean;
  }) => Promise<URLSearchParams>;
}): ColumnDef<TestimoniesResponse>[] => [
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
    header: () => <div className="text-xs">Title</div>,
    accessorKey: "title",
  },
  {
    header: () => <div className="text-xs">Rating</div>,
    accessorKey: "rating",
    cell: ({ row }) => {
      const testimoni = row.original;

      return (
        <Rating defaultValue={testimoni.rating} readOnly>
          {Array.from({ length: 5 }).map((_, index) => (
            <RatingButton key={index} className="size-4 text-yellow-500" />
          ))}
        </Rating>
      );
    },
  },
  {
    header: () => <div className="text-xs">Customer</div>,
    accessorKey: "user",
  },
  {
    header: () => <div className="text-xs">Status</div>,
    accessorKey: "status",
    cell: ({ row }) => (
      <Badge
        className={cn(
          row.original.status
            ? "bg-green-200 text-black"
            : "bg-gray-200 text-black"
        )}
      >
        {row.original.status ? "Publish" : "Unpublish"}
      </Badge>
    ),
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
            <DropdownMenuItem
              className="text-xs"
              onSelect={() => handleUpdate(order.id, !order.status)}
            >
              {order.status ? <Circle /> : <CircleDot />}
              {order.status ? "Unpublish" : "Publish"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs"
              onSelect={() => setQuery({ reviewId: order.id, dialog: true })}
            >
              <ReceiptText className="size-3.5" />
              Detail
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
