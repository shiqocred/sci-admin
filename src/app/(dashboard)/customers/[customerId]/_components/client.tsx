"use client";

import React, { useMemo } from "react";
import { useGetCustomer } from "../_api/query/use-get-customer";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Download,
  RefreshCw,
  Trash2,
  UserRound,
} from "lucide-react";
import { TooltipText } from "@/providers/tooltip-provider";
import { Separator } from "@/components/ui/separator";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";
import Link from "next/link";
import { format } from "date-fns";
import { useDownloadExport } from "../_api";
import { id } from "date-fns/locale";
import { ParamsLoading } from "../../_components/_loading/params";
import { DataCustomer } from "./_section/data-customer";
import { StatistictCustomers } from "./_section/statistict-customers";
import { useDeleteCustomer, useVerifyEmailCustomer } from "../../_api";

export const Client = () => {
  const { customerId } = useParams();
  const router = useRouter();

  const [VerifyDialog, confirmVerify] = useConfirm(
    "Verify Email",
    "This action cannot be undone"
  );

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete User",
    "This action cannot be undone",
    "destructive"
  );

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteCustomer();

  const { mutate: verifyEmail, isPending: isVerifiying } =
    useVerifyEmailCustomer();

  const { data, refetch, isRefetching, isPending } = useGetCustomer({
    userId: customerId as string,
  });

  const loading = isPending || isRefetching || isVerifiying || isDeleting;

  const customer = useMemo(() => {
    return data?.data;
  }, [data]);

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteUser(
      { params: { id: customerId as string } },
      {
        onSuccess: () => {
          router.push("/customers");
        },
      }
    );
  };

  const handleVerify = async () => {
    const ok = await confirmVerify();
    if (!ok) return;
    verifyEmail({ params: { id: customerId as string } });
  };

  const { mutate: exportData, isPending: isExporting } = useDownloadExport();

  const handleDownload = () => {
    exportData(
      { params: { customerId: customerId as string } },
      {
        onSuccess: (res) => {
          const url = globalThis.URL.createObjectURL(res.data);
          const link = document.createElement("a");
          link.href = url;
          link.download = `REPORT CUSTOMER (${customer?.name}) - ${format(new Date(), "P_HH_mm_ss", { locale: id })}.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        },
      }
    );
  };

  if (isPending) return <ParamsLoading />;

  return (
    <div className="w-full flex flex-col gap-6">
      <VerifyDialog />
      <DeleteDialog />
      <div className="w-full flex items-center gap-4 justify-between">
        <div className="flex gap-2 items-center">
          <Button size={"icon"} className="size-8" variant={"ghost"} asChild>
            <Link href={"/customers"}>
              <UserRound />
            </Link>
          </Button>
          <ChevronRight className="size-4" />
          <h1 className="text-xl font-semibold">Detail Customers</h1>
        </div>
        <div className="flex gap-2 items-center">
          <TooltipText value="Reload Data" side="bottom">
            <Button
              size={"icon"}
              className="size-8"
              variant={"outline"}
              onClick={() => refetch()}
              disabled={loading}
            >
              <RefreshCw
                className={cn("size-3.5", loading && "animate-spin")}
              />
            </Button>
          </TooltipText>
          <TooltipText value="Export Detail" side="bottom">
            <Button
              size={"icon"}
              className="size-8"
              variant={"outline"}
              onClick={handleDownload}
              disabled={isExporting || loading}
            >
              <Download className="size-3.5" />
            </Button>
          </TooltipText>
          <TooltipText value="Delete" side="bottom">
            <Button
              size={"icon"}
              className="size-8"
              variant={"outline"}
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </TooltipText>
        </div>
      </div>
      <Separator />
      {customer && !isPending ? (
        <div className="flex flex-col gap-6 w-full">
          <DataCustomer
            customer={customer}
            handleVerify={handleVerify}
            loading={loading}
          />
          <StatistictCustomers customer={customer} />
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full">
          <Skeleton className="h-[183px] w-full" />
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      )}
    </div>
  );
};
