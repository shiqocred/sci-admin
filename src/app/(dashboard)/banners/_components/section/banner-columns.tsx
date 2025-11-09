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
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { cn, sizesImage } from "@/lib/utils";
import { BannerProps } from "../../_api";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-200 text-black font-normal";
    case "scheduled":
      return "bg-yellow-200 text-black font-normal";
    case "expired":
      return "bg-gray-200 text-black font-normal";
    default:
      return "";
  }
};

const BannerActions = ({
  banner,
  isLoading,
  handleDelete,
  handleUpdateStatus,
}: any) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
        <span className="sr-only">Open menu</span>
        {isLoading ? <Loader2 className="animate-spin" /> : <MoreHorizontal />}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel className="text-xs font-semibold">
        Actions
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      {banner.status === "active" ? (
        <DropdownMenuItem
          className="text-xs"
          onSelect={() => handleUpdateStatus(banner.status, banner.id)}
        >
          <Circle className="size-3.5" />
          Deactivate
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem
          className="text-xs"
          onSelect={() => handleUpdateStatus(banner.status, banner.id)}
        >
          <CircleDot className="size-3.5" />
          Activate
        </DropdownMenuItem>
      )}
      <DropdownMenuItem className="text-xs" asChild>
        <Link href={`/banners/${banner.id}`}>
          <Edit className="size-3.5" />
          Edit
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={() => handleDelete(banner.id)}
        className="text-xs text-red-400 focus:text-red-500 group"
      >
        <Trash2 className="size-3.5 text-red-400 group-focus:text-red-500" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const bannerColumns = ({
  metaPage,
  handleDelete,
  handleUpdateStatus,
  isLoading,
}: {
  metaPage: MetaPageProps;
  handleDelete: (id: string) => Promise<void>;
  handleUpdateStatus: (status: any, id: string) => void;
  isLoading: boolean;
}): ColumnDef<BannerProps>[] => [
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
      const banner = row.original;

      return (
        <div className="size-10 relative rounded overflow-hidden flex items-center justify-center border">
          {banner.image ? (
            <Image
              src={banner.image}
              alt={banner.name}
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
        <Badge className={cn("capitalize", getStatusBadgeClass(status))}>
          {status}
        </Badge>
      );
    },
  },
  {
    header: () => <div className="text-center">Apply to</div>,
    accessorKey: "apply",
    cell: ({ row }) => <div className="text-wrap">{row.original.apply}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row: { original: banner } }) => (
      <BannerActions
        banner={banner}
        isLoading={isLoading}
        handleDelete={handleDelete}
        handleUpdateStatus={handleUpdateStatus}
      />
    ),
  },
];
