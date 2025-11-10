import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn, sizesImage } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { CheckCircle2, Eye, EyeIcon, Loader, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useConfirm } from "@/hooks/use-confirm";
import { RejectDialog } from "./reject-dialog";
import { useGetCustomersReview, useReviewCustomer } from "../../_api";

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

  const { mutate: update, isPending: isUpdating } = useReviewCustomer();

  const { data, isPending, refetch, isRefetching } = useGetCustomersReview({
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
          setUrlReview("");
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
          setUrlReview("");
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
                Review{" "}
                {isActive === "KTP"
                  ? reviewData?.personalIdType === "NIK"
                    ? "KTP"
                    : reviewData?.personalIdType
                  : isActive}
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
                <div className="grid grid-cols-2 gap-4 px-5 mt-10 mb-16">
                  {reviewData?.personalIdFile && (
                    <div className="flex flex-col w-full items-center justify-center gap-2 text-sm">
                      <div className="relative aspect-[107/68] w-full overflow-hidden rounded-lg shadow">
                        <Image
                          src={reviewData.personalIdFile}
                          fill
                          sizes={sizesImage}
                          className="object-cover"
                          alt="KTP"
                        />
                      </div>
                      <Button
                        onClick={() => {
                          setUrlReview(
                            reviewData.personalIdFile ?? "/images/logo-sci.png"
                          );
                          setIsActive("KTP");
                        }}
                        className="h-7 rounded-full bg-white text-black font-semibold text-xs hover:bg-white hover:text-black/50"
                      >
                        <Eye />
                        {reviewData?.personalIdType === "NIK"
                          ? "KTP"
                          : reviewData?.personalIdType}
                      </Button>
                    </div>
                  )}
                  {reviewData?.storefrontFile && (
                    <div className="flex flex-col w-full items-center justify-center gap-2 text-sm">
                      <div className="relative aspect-[107/68] w-full overflow-hidden rounded-lg shadow">
                        <Image
                          src={reviewData.storefrontFile}
                          fill
                          sizes={sizesImage}
                          className="object-cover"
                          alt="Pet Shop Building"
                        />
                      </div>
                      <Button
                        onClick={() => {
                          setUrlReview(
                            reviewData.storefrontFile ?? "/images/logo-sci.png"
                          );
                          setIsActive("Pet Shop Building");
                        }}
                        className="h-7 rounded-full bg-white text-black font-semibold text-xs hover:bg-white hover:text-black/50"
                      >
                        <Eye />
                        Pet Shop Building
                      </Button>
                    </div>
                  )}
                  {reviewData?.veterinarianIdFile && (
                    <div className="flex flex-col w-full items-center justify-center gap-2 text-sm">
                      <div className="relative aspect-[107/68] w-full overflow-hidden rounded-lg shadow">
                        <Image
                          src={reviewData.veterinarianIdFile}
                          fill
                          sizes={sizesImage}
                          className="object-cover"
                          alt="KTA"
                        />
                      </div>
                      <Button
                        onClick={() => {
                          setUrlReview(
                            reviewData.veterinarianIdFile ??
                              "/images/logo-sci.png"
                          );
                          setIsActive("KTA");
                        }}
                        className="h-7 rounded-full bg-white text-black font-semibold text-xs hover:bg-white hover:text-black/50"
                      >
                        <Eye />
                        KTA
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-col bg-white">
                  <div className="min-h-10 py-3 border-b border-gray-100 flex items-center gap-3 text-xs font-medium">
                    <div className="pl-5 text-gray-500 whitespace-nowrap w-24 flex-none">
                      {reviewData?.personalIdType}
                    </div>
                    <div className="pr-5">{reviewData?.personalId}</div>
                  </div>
                  {reviewData?.veterinarianId && (
                    <div className="min-h-10 py-3 border-b border-gray-100 flex items-center gap-3 text-xs font-medium">
                      <div className="pl-5 text-gray-500 whitespace-nowrap w-24 flex-none">
                        No KTA
                      </div>
                      <div className="pr-5">{reviewData?.veterinarianId}</div>
                    </div>
                  )}
                  <div className="min-h-10 py-3 border-b border-gray-100 flex items-center gap-3 text-xs font-medium">
                    <div className="pl-5 text-gray-500 whitespace-nowrap w-24 flex-none">
                      Full Name
                    </div>
                    <div className="pr-5">{reviewData?.fullName}</div>
                  </div>
                  <div className="min-h-10 py-3 border-b border-gray-100 flex items-center gap-3 text-xs font-medium">
                    <div className="pl-5 text-gray-500 whitespace-nowrap w-24 flex-none">
                      Current Role
                    </div>
                    <div className="pr-5">{reviewData?.role}</div>
                  </div>
                  <div className="min-h-10 py-3 border-b border-gray-100 flex items-center gap-3 text-xs font-medium">
                    <div className="pl-5 text-gray-500 whitespace-nowrap w-24 flex-none">
                      New Role
                    </div>
                    <div className="pr-5">{reviewData?.newRole}</div>
                  </div>
                </div>
                <div className="w-full h-10 grid grid-cols-2 mt-4">
                  <RejectDialog
                    handleReject={handleReject}
                    input={input}
                    isOpen={isReject}
                    setIsOpen={setIsReject}
                    loading={loading}
                    setInput={setInput}
                    isPublic={true}
                  />
                  <Button
                    onClick={handleApprove}
                    className="w-full h-full rounded-none shadow-none bg-green-300 text-black hover:bg-green-400"
                  >
                    <CheckCircle2 />
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
