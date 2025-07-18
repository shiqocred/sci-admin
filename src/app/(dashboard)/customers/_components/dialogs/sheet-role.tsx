import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn, sizesImage } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { Check, Eye, EyeIcon, Loader, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useUpdateReview, useGetReviewUpgrade } from "../../_api";
import { useConfirm } from "@/hooks/use-confirm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

export const SheetRole = ({
  open,
  onOpenChange,
  id,
}: {
  open: boolean;
  onOpenChange: () => void;
  id: string;
}) => {
  const [urlReview, setUrlReview] = useState("");
  const [isActive, setIsActive] = useState("");
  const [isReject, setIsReject] = useState(false);
  const [input, setInput] = useState("");

  const [ApproveDialog, confirmApprove] = useConfirm(
    "Approve Document",
    "This action cannot be undone"
  );

  const { mutate: update, isPending: isUpdating } = useUpdateReview();

  const { data, isPending, refetch, isRefetching } = useGetReviewUpgrade({
    id,
  });

  const loading = isUpdating || isPending || isRefetching;

  const reviewData = useMemo(() => {
    return data?.data;
  }, [data]);

  const handleApprove = async () => {
    const ok = await confirmApprove();
    if (!ok) return;

    update(
      { body: { status: "approve" }, params: { id } },
      {
        onSuccess: () => {
          onOpenChange();
          setIsActive("");
          setInput("");
          setIsReject(false);
        },
      }
    );
  };

  const handleReject = async () => {
    update(
      { body: { status: "reject", message: input }, params: { id } },
      {
        onSuccess: () => {
          onOpenChange();
          setInput("");
          setIsReject(false);
          setIsActive("");
        },
      }
    );
  };

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <ApproveDialog />
      <SheetContent
        className={cn(
          "flex flex-row items-center gap-0",
          urlReview ? "sm:min-w-7xl" : "sm:max-w-md"
        )}
      >
        {urlReview && (
          <div className="max-w-full w-full h-full flex items-center justify-center relative">
            <div className="flex items-center absolute top-4 gap-2">
              <div className=" text-sm font-semibold flex items-center gap-2 px-3 h-7 bg-gray-200 rounded-full">
                <EyeIcon className="size-4" />
                Review {isActive}
              </div>
              <TooltipText value="Close Preview">
                <Button
                  onClick={() => {
                    setUrlReview("");
                    setIsActive("");
                  }}
                  className="p-0 size-7 rounded-full bg-gray-200 hover:bg-gray-300 text-black group"
                >
                  <X className="size-4 transition-all group-hover:rotate-180 ease-in-out duration-500" />
                </Button>
              </TooltipText>
            </div>
            <div className="relative aspect-[107/68] w-11/12 overflow-hidden rounded-lg shadow">
              <Image
                src={urlReview}
                fill
                sizes={sizesImage}
                className="object-cover"
                alt="KTP"
              />
            </div>
          </div>
        )}
        <div
          className={cn(
            "flex flex-col gap-4 bg-gray-100 h-full sm:max-w-md w-full",
            urlReview && "border-l border-gray-100"
          )}
        >
          <SheetHeader>
            <SheetTitle>Review document upgrade</SheetTitle>
          </SheetHeader>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center flex-col gap-3">
              <Loader className="animate-spin" />
              <p className="text-sm">Loading document...</p>
            </div>
          ) : (
            <div className="h-[calc(100vh-56px+16px)] overflow-y-auto">
              <div className="flex flex-col pb-10">
                {reviewData?.fileKtp && (
                  <div className="flex flex-col w-full items-center px-10 justify-center border-b border-white py-5 gap-2 text-sm">
                    <div className="relative aspect-[107/68] w-full overflow-hidden rounded-lg shadow">
                      <Image
                        src={reviewData.fileKtp}
                        fill
                        sizes={sizesImage}
                        className="object-cover"
                        alt="KTP"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        setUrlReview(reviewData.fileKtp);
                        setIsActive("KTP");
                      }}
                      className="h-7 rounded-full bg-white text-black font-semibold text-xs hover:bg-white hover:text-black/50"
                    >
                      <Eye />
                      KTP
                    </Button>
                  </div>
                )}
                {reviewData?.storefront && (
                  <div className="flex flex-col w-full items-center px-10 justify-center py-5 gap-2 text-sm">
                    <div className="relative aspect-[107/68] w-full overflow-hidden rounded-lg shadow">
                      <Image
                        src={reviewData.storefront}
                        fill
                        sizes={sizesImage}
                        className="object-cover"
                        alt="Pet Shop Building"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        setUrlReview(reviewData.storefront);
                        setIsActive("Pet Shop Building");
                      }}
                      className="h-7 rounded-full bg-white text-black font-semibold text-xs hover:bg-white hover:text-black/50"
                    >
                      <Eye />
                      Pet Shop Building
                    </Button>
                  </div>
                )}
                {reviewData?.fileKta && (
                  <div className="flex flex-col w-full items-center px-10 justify-center py-5 gap-2 text-sm">
                    <div className="relative aspect-[107/68] w-full overflow-hidden rounded-lg shadow">
                      <Image
                        src={reviewData.fileKta}
                        fill
                        sizes={sizesImage}
                        className="object-cover"
                        alt="KTA"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        setUrlReview(reviewData.fileKta);
                        setIsActive("KTA");
                      }}
                      className="h-7 rounded-full bg-white text-black font-semibold text-xs hover:bg-white hover:text-black/50"
                    >
                      <Eye />
                      KTA
                    </Button>
                  </div>
                )}
                <div className="flex flex-col bg-white">
                  <div className="min-h-10 py-3 border-b border-gray-100 flex items-center gap-3 text-xs font-medium">
                    <div className="pl-5 text-gray-500 whitespace-nowrap w-24 flex-none">
                      NIK
                    </div>
                    <div className="pr-5">{reviewData?.nik}</div>
                  </div>
                  {reviewData?.noKta && (
                    <div className="min-h-10 py-3 border-b border-gray-100 flex items-center gap-3 text-xs font-medium">
                      <div className="pl-5 text-gray-500 whitespace-nowrap w-24 flex-none">
                        No KTA
                      </div>
                      <div className="pr-5">{reviewData?.noKta}</div>
                    </div>
                  )}
                  <div className="min-h-10 py-3 border-b border-gray-100 flex items-center gap-3 text-xs font-medium">
                    <div className="pl-5 text-gray-500 whitespace-nowrap w-24 flex-none">
                      Full Name
                    </div>
                    <div className="pr-5">{reviewData?.name}</div>
                  </div>
                </div>
                <div className="w-full h-10 grid grid-cols-2 mt-4">
                  <Dialog open={isReject} onOpenChange={setIsReject}>
                    <DialogTrigger asChild>
                      <Button className="w-full h-full rounded-none shadow-none bg-red-300 text-black hover:bg-red-400 ">
                        <X />
                        Rejected
                      </Button>
                    </DialogTrigger>
                    <DialogContent showCloseButton={false}>
                      <DialogHeader>
                        <DialogTitle>Reject Document</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col gap-1.5">
                        <Label>Message</Label>
                        <Textarea
                          className="focus-visible:ring-0"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          variant={"outline"}
                          onClick={() => {
                            setIsReject(false);
                            setInput("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleReject}
                          disabled={!input}
                          className="bg-red-300 text-black hover:bg-red-400 "
                        >
                          Confirm
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    onClick={handleApprove}
                    className="w-full h-full rounded-none shadow-none bg-green-300 text-black hover:bg-green-400"
                  >
                    <Check />
                    Approved
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
