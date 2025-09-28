"use client";

import { Button } from "@/components/ui/button";
import { Check, Loader2, Plus, Send, Trash2, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateTrending,
  useDeleteTrending,
  useGetProductTrendings,
  useUpdateTrending,
} from "../_api";
import { useSearchQuery } from "@/lib/search";
import { Input } from "@/components/ui/input";
import { cn, sizesImage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/hooks/use-confirm";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendingSlotProps {
  position: string;
  trending?: { id: string; name: string; image?: string };
  onSelect: (pos: string, productId?: string) => void;
  onUnlink: (pos: string) => void;
}

interface TrendingListProps {
  isLoading: boolean;
  trendingByPosition: Record<
    string,
    { id: string; name: string; image?: string }
  >;
  onSelect: (pos: string, productId?: string) => void;
  onUnlink: (pos: string) => void;
}

type Mode = "link" | "update" | "delete" | "";

export const ProductTrending = () => {
  const [isOpen, setIsOpen] = useState<string>("");
  const [mode, setMode] = useState<Mode>("");
  const [selected, setSelected] = useState<string>("");

  const [DeleteDialog, confirmDelete] = useConfirm(
    `Unlink Trending Product ${isOpen}?`,
    "This action cannot be undone",
    "destructive"
  );

  const { mutate: linkTrending, isPending: isLinking } = useCreateTrending();
  const { mutate: updateTrending, isPending: isUpdating } = useUpdateTrending();
  const { mutate: unlinkTrending, isPending: isUnlinking } =
    useDeleteTrending();

  const isLoading = isLinking || isUnlinking || isUpdating;
  const { search, searchValue, setSearch } = useSearchQuery("q1");
  const { data, isPending } = useGetProductTrendings({ q: searchValue });

  const productTrending = useMemo(() => data?.data ?? [], [data]);
  const trendingByPosition = useMemo(
    () =>
      productTrending.reduce<Record<string, any>>((acc, cur) => {
        if (cur.position) {
          acc[cur.position] = cur;
        }
        return acc;
      }, {}),
    [productTrending]
  );

  const handleLink = () => {
    linkTrending(
      { body: { productId: selected, position: isOpen } },
      { onSuccess: resetDialog }
    );
  };

  const handleUpdate = () => {
    updateTrending(
      { body: { productId: selected }, params: { position: isOpen } },
      { onSuccess: resetDialog }
    );
  };

  const handleUnlink = async (position: string) => {
    const ok = await confirmDelete();
    if (!ok) return;
    unlinkTrending({ params: { position } }, { onSuccess: resetDialog });
  };

  const resetDialog = () => {
    setIsOpen("");
    setSelected("");
    setMode("");
  };

  const handleSelectSlot = (pos: string, productId?: string) => {
    setIsOpen(pos);
    setSelected(productId ?? "");
    setMode(productId ? "update" : "link");
  };

  useEffect(() => {
    if (!isOpen) setMode("");
  }, [isOpen]);

  return (
    <div className="w-full flex flex-col gap-3 rounded-lg border border-gray-300 p-3">
      <DeleteDialog />
      <h5 className="text-sm font-semibold">Trending Products</h5>

      <TrendingList
        isLoading={isPending || isLoading}
        trendingByPosition={trendingByPosition}
        onSelect={handleSelectSlot}
        onUnlink={(p) => {
          setIsOpen(p);
          setMode("delete");
          handleUnlink(p);
        }}
      />

      {/* Dialog */}
      <Dialog
        open={!!isOpen && (mode === "link" || mode === "update")}
        onOpenChange={resetDialog}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {mode} Trending Product {isOpen}
            </DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <Input
            className="border-gray-300 focus-visible:ring-0 focus-visible:border-gray-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product..."
          />

          {isLoading ? (
            <div className="h-60 flex items-center justify-center">
              <Loader2 className="animate-spin size-5" />
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto gap-1 flex flex-col">
              {productTrending.map((product) => {
                const isDisabled =
                  !!product.position && product.position !== isOpen;
                return (
                  <Button
                    key={product.id}
                    className="w-full gap-2 p-2 bg-gray-100 rounded-md h-auto hover:bg-gray-200 text-black disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed"
                    disabled={isDisabled}
                    onClick={() =>
                      setSelected((prev) =>
                        prev === product.id ? "" : product.id
                      )
                    }
                  >
                    <div className="size-10 relative rounded overflow-hidden flex-none">
                      <Image
                        src={product.image ?? "/images/logo-sci.png"}
                        fill
                        alt={product.name}
                        sizes={sizesImage}
                      />
                    </div>
                    <p className="text-sm whitespace-nowrap text-ellipsis overflow-hidden">
                      {product.name}
                    </p>
                    <div className="ml-auto mr-3">
                      {isDisabled ? (
                        <Badge>Trending of {product.position}</Badge>
                      ) : (
                        selected === product.id && (
                          <Check className="size-3.5" />
                        )
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetDialog}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <X />}
              Cancel
            </Button>
            <Button
              onClick={mode === "link" ? handleLink : handleUpdate}
              disabled={!selected || isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TrendingSlot = ({
  position,
  trending,
  onSelect,
  onUnlink,
}: TrendingSlotProps) => {
  return (
    <div className="w-full grid h-16 grid-cols-9 relative">
      <Button
        onClick={() => onSelect(position, trending?.id)}
        className={cn(
          "w-full h-full bg-gray-100 border border-gray-200 text-black hover:bg-gray-300 group justify-start p-0",
          trending ? "col-span-8 rounded-r-none" : "col-span-9"
        )}
      >
        {trending ? (
          <div className="flex items-center w-full gap-2 p-2">
            <div className="size-10 relative rounded overflow-hidden flex-none">
              <Image
                src={trending.image ?? "/images/logo-sci.png"}
                fill
                alt={trending.name}
                sizes={sizesImage}
              />
            </div>
            <p className="text-xs whitespace-nowrap text-ellipsis overflow-hidden">
              {trending.name}
            </p>
          </div>
        ) : (
          <div className="flex items-center w-full gap-2 px-3 py-1.5">
            <div className="size-8 flex items-center justify-center rounded-full border border-gray-300 group-hover:border-gray-400">
              <Plus />
            </div>
            Select Product
          </div>
        )}
      </Button>
      {trending && (
        <Button
          className="flex-none w-full h-full rounded-l-none hover:bg-red-600"
          size="icon"
          onClick={() => onUnlink(position)}
        >
          <Trash2 />
        </Button>
      )}
    </div>
  );
};

const TrendingList = ({
  isLoading,
  trendingByPosition,
  onSelect,
  onUnlink,
}: TrendingListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((pos) => (
        <TrendingSlot
          key={pos}
          position={String(pos)}
          trending={trendingByPosition[String(pos)]}
          onSelect={onSelect}
          onUnlink={onUnlink}
        />
      ))}
    </div>
  );
};

export default TrendingList;
