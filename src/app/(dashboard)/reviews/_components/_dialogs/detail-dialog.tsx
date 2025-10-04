import React, { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LabelInput } from "@/components/label-input";
import { Label } from "@/components/ui/label";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import {
  ChartNoAxesGanttIcon,
  ChevronRight,
  LoaderIcon,
  Save,
  ShoppingBag,
  X,
} from "lucide-react";
import { sizesImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGetShowReview } from "../../_api";

export const DetailDialog = ({
  dialog,
  reviewId,
  setQuery,
  input,
  setInput,
  handleUpdate,
}: {
  dialog: boolean;
  reviewId: string;
  setQuery: ({
    reviewId,
    dialog,
  }: {
    reviewId: string;
    dialog: boolean;
  }) => void;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  handleUpdate: (id?: string, status?: boolean) => void;
}) => {
  const { data: reviewDetail, isPending: isPendingDetail } = useGetShowReview({
    reviewId,
  });
  const detailReview = useMemo(() => reviewDetail?.data, [reviewDetail]);
  useEffect(() => {
    if (detailReview) {
      setInput(detailReview.status);
    }
  }, [detailReview]);
  return (
    <Sheet
      open={dialog && !!reviewId}
      onOpenChange={() => {
        setQuery({
          reviewId: "",
          dialog: false,
        });
      }}
    >
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Review Detail</SheetTitle>
          <SheetDescription />
        </SheetHeader>
        {isPendingDetail && (
          <div className="px-4 flex flex-col gap-2 justify-center items-center h-[80vh]">
            <LoaderIcon className="size-4 animate-spin" />
            <p className="ml-2 animate-pulse text-sm">Loading...</p>
          </div>
        )}
        {detailReview && (
          <div className="px-4 flex flex-col gap-4 overflow-y-auto">
            <LabelInput
              label="Title"
              defaultValue={detailReview.title}
              disabled
              className="disabled:opacity-100"
            />
            <div className="flex flex-col gap-1">
              <Label>Rating</Label>
              <Rating defaultValue={detailReview.rating} readOnly>
                {Array.from({ length: 5 }, (_, i) => (
                  <RatingButton key={i} className="text-yellow-500" />
                ))}
              </Rating>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Description</Label>
              <Textarea
                defaultValue={detailReview.description}
                className="border-gray-300 focus-visible:border-gray-500 focus-visible:ring-0 min-h-32 disabled:opacity-100 disabled:cursor-default resize-none"
                disabled
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {detailReview.images.map((image) => (
                <div
                  key={image}
                  className="w-full aspect-square rounded-md border shadow relative overflow-hidden"
                >
                  <Image
                    fill
                    src={image ?? "/images/logo-sci.png"}
                    alt={detailReview.title}
                    sizes={sizesImage}
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Product Relations</Label>
              <div className="border w-full rounded-md overflow-hidden divide-y">
                {detailReview.product.map((i) => (
                  <Link
                    key={i.id}
                    className="min-h-8 py-1.5 px-3 flex items-center gap-2 text-sm hover:underline hover:underline-offset-2"
                    href={`/products/${i.id}/detail`}
                  >
                    <ChartNoAxesGanttIcon className="size-4" />
                    <ChevronRight className="size-3.5" />
                    <p>{i.name}</p>
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Order Relation</Label>
              <div className="border w-full rounded-md overflow-hidden divide-y">
                <Link
                  className="h-8 px-3 flex items-center gap-2 text-sm hover:underline hover:underline-offset-2 font-medium"
                  href={`/orders/${detailReview.orderId}`}
                >
                  <ShoppingBag className="size-4" />
                  <ChevronRight className="size-3.5" />
                  <p>#{detailReview.orderId}</p>
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Customer</Label>
              <Button
                className="flex items-center gap-4 p-2 text-sm border rounded-lg h-auto justify-start text-start group"
                variant={"outline"}
                asChild
              >
                <Link href={"/customers/" + detailReview.user.id}>
                  <div className="size-12 relative overflow-hidden border rounded-md">
                    <Image
                      fill
                      src={detailReview.user.image ?? "/images/logo-sci.png"}
                      alt={detailReview.user.name}
                      sizes={sizesImage}
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-medium group-hover:underline underline-offset-2">
                      {detailReview.user.name}
                    </p>
                    <p className="text-gray-500">{detailReview.user.email}</p>
                  </div>
                </Link>
              </Button>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Status</Label>
              <Select value={input} onValueChange={(e) => setInput(e)}>
                <SelectTrigger className="border-gray-300 focus-visible:border-gray-300 focus-visible:ring-0 w-full data-[state=open]:border-gray-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="publish">Publish</SelectItem>
                    <SelectItem value="unpublish">Unpublish</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={"outline"}
                onClick={() => {
                  setQuery({
                    reviewId: "",
                    dialog: false,
                  });
                }}
              >
                <X />
                Cancel
              </Button>
              <Button onClick={() => handleUpdate()} className="col-span-2">
                <Save />
                Save
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
