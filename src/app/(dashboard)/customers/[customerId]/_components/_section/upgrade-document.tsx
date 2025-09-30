import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, IdCard, XCircle } from "lucide-react";
import React, { useState } from "react";
import { Customer } from "../../_api";
import { cn, formatRole } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { RejectDialog } from "../../../_components/dialogs/reject-dialog";
import { useUpdateReview } from "../../../_api";
import { PreviewDialog } from "../dialogs/preview-dialog";
import { useConfirm } from "@/hooks/use-confirm";
import { invalidateQuery } from "@/lib/query";
import { QueryClient } from "@tanstack/react-query";

const DocumentCard = ({
  label,
  fileUrl,
  alt,
  onClickLabel,
}: {
  label: string;
  fileUrl: string;
  alt: string;
  onClickLabel: () => void;
}) => (
  <div className="flex flex-col gap-1.5">
    <p className="text-xs font-semibold">{label}</p>
    <Button
      onClick={onClickLabel}
      className="aspect-[107/67] w-full relative shadow rounded-md overflow-hidden h-auto flex-auto"
    >
      <Image src={fileUrl} fill alt={alt} />
    </Button>
  </div>
);

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col gap-0.5 group cursor-default">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium group-hover:underline">{value}</p>
  </div>
);

const DocumentHeader = ({ customer }: { customer: Customer }) => (
  <div className="px-5 py-3 flex gap-3 items-center justify-between">
    <div className="flex gap-3 items-center">
      <IdCard className="size-4" />
      <h5>Document Updrading</h5>
    </div>
    {customer.role !== customer.newRole ? (
      <div className="flex items-center gap-2">
        <Badge variant={"outline"} className="text-[10px]">
          {customer.role && formatRole(customer.role)}
        </Badge>
        {customer.status === "REJECTED" ? (
          <XCircle className="size-4" />
        ) : (
          <ArrowRight className="size-4" />
        )}
        <Badge
          variant={"outline"}
          className={cn(
            "text-[10px]",
            customer.status === "REJECTED" && "line-through"
          )}
        >
          {customer.newRole && formatRole(customer.newRole)}
        </Badge>
      </div>
    ) : (
      <div className="flex items-center">
        <Badge variant={"outline"} className="text-[10px]">
          {customer.role && formatRole(customer.role)}
        </Badge>
      </div>
    )}
  </div>
);

const RejectedMessage = ({ message }: { message: string }) => (
  <div className="px-5 py-3 flex flex-col gap-2 text-sm items-center">
    <p className="text-xl font-semibold text-red-500">REJECTED</p>
    <p>{`"${message}"`}</p>
  </div>
);

const DocumentGrid = ({
  customer,
  openDocument,
}: {
  customer: Customer;
  openDocument: (label: string, url: string) => void;
}) => (
  <div className="px-5 py-3 flex flex-col gap-4">
    <div className="grid grid-cols-2 gap-4">
      {(customer.role === "PETSHOP" || customer.newRole === "PETSHOP") &&
      customer.personalIdType ? (
        <DocumentCard
          label={
            customer.personalIdType === "NIK" ? "KTP" : customer.personalIdType
          }
          fileUrl={customer.personalIdFile ?? "/images/logo-sci.png"}
          alt={
            customer.personalIdType === "NIK" ? "KTP" : customer.personalIdType
          }
          onClickLabel={() =>
            openDocument(
              (customer.personalIdType === "NIK"
                ? "KTP"
                : customer.personalIdType) ?? "",
              customer.personalIdFile ?? "/images/logo-sci.png"
            )
          }
        />
      ) : (
        <DocumentCard
          label="KTP"
          fileUrl={customer.personalIdFile ?? "/images/logo-sci.png"}
          alt="KTP"
          onClickLabel={() =>
            openDocument(
              "KTP",
              customer.personalIdFile ?? "/images/logo-sci.png"
            )
          }
        />
      )}
      {customer.role === "PETSHOP" || customer.newRole === "PETSHOP" ? (
        <DocumentCard
          label="Pet Shop Building"
          fileUrl={customer.storefrontFile ?? "/images/logo-sci.png"}
          alt="storefront"
          onClickLabel={() =>
            openDocument(
              "Pet Shop Building",
              customer.storefrontFile ?? "/images/logo-sci.png"
            )
          }
        />
      ) : (
        <DocumentCard
          label="KTA"
          fileUrl={customer.veterinarianIdFile ?? "/images/logo-sci.png"}
          alt="KTA"
          onClickLabel={() =>
            openDocument(
              "KTA",
              customer.veterinarianIdFile ?? "/images/logo-sci.png"
            )
          }
        />
      )}
    </div>
    <InfoRow label="Full Name" value={customer.fullName} />
    <InfoRow
      label={
        customer.role === "VETERINARIAN"
          ? "NIK Number"
          : `${customer.personalIdType} Number`
      }
      value={customer.personalId}
    />
    {customer.role === "VETERINARIAN" && (
      <InfoRow label="KTA Number" value={customer.veterinarianId} />
    )}
  </div>
);

const DocumentFooter = ({
  customer,
  isUpdating,
  handleApprove,
  state,
  setState,
  handleReject,
}: {
  customer: Customer;
  isUpdating: boolean;
  handleApprove: () => Promise<void>;
  state: {
    isReject: boolean;
    input: string;
    isOpen: string;
    urlDoc: string;
  };
  setState: React.Dispatch<
    React.SetStateAction<{
      isReject: boolean;
      input: string;
      isOpen: string;
      urlDoc: string;
    }>
  >;
  handleReject: () => void;
}) => (
  <div className="px-5 py-3 w-full">
    {customer.role !== customer.newRole && customer.status === "PENDING" ? (
      <div className="ml-auto flex items-center gap-3 w-fit">
        <Button
          size={"sm"}
          className="text-xs bg-green-300 text-black hover:bg-green-400"
          onClick={handleApprove}
          disabled={isUpdating}
        >
          <CheckCircle2 className="size-3.5" />
          Approve
        </Button>
        <RejectDialog
          isOpen={state.isReject}
          setIsOpen={(isReject) => setState((prev) => ({ ...prev, isReject }))}
          loading={isUpdating}
          input={state.input}
          setInput={(input) => setState((prev) => ({ ...prev, input }))}
          handleReject={handleReject}
        />
      </div>
    ) : (
      <p className="text-sm ml-auto w-fit">
        {customer.status === "APPROVED" ? "Approved" : "Rejected"} at{" "}
        {customer.updatedAt}
      </p>
    )}
  </div>
);

export const UpgradeDocument = ({
  customer,
  customerId,
  queryClient,
}: {
  customer: Customer;
  customerId: string;
  queryClient: QueryClient;
}) => {
  const [state, setState] = useState({
    isReject: false,
    input: "",
    isOpen: "",
    urlDoc: "/images/logo-sci.png",
  });

  const [ApproveDialog, confirmApprove] = useConfirm(
    "Approve Document",
    "This action cannot be undone"
  );

  const { mutate: update, isPending: isUpdating } = useUpdateReview();

  const handleSuccess = async () => {
    setState((prev) => ({ ...prev, input: "", isReject: false }));
    await invalidateQuery(queryClient, [["customers-detail", customerId]]);
  };

  const handleApprove = async () => {
    const ok = await confirmApprove();
    if (!ok) return;

    update(
      { body: { status: "approve" }, params: { id: customerId } },
      {
        onSuccess: handleSuccess,
      }
    );
  };

  const handleReject = async () => {
    update(
      {
        body: { status: "reject", message: state.input },
        params: { id: customerId },
      },
      {
        onSuccess: handleSuccess,
      }
    );
  };

  const openDocument = (label: string, url: string) => {
    setState((prev) => ({
      ...prev,
      isOpen: label,
      urlDoc: url || "/images/logo-sci.png",
    }));
  };

  return (
    <div className="flex flex-col rounded-lg border border-gray-300">
      <ApproveDialog />
      <PreviewDialog
        open={state.isOpen}
        setOpen={(isOpen) => setState((prev) => ({ ...prev, isOpen }))}
        setUrl={(urlDoc) => setState((prev) => ({ ...prev, urlDoc }))}
        url={state.urlDoc}
      />
      <DocumentHeader customer={customer} />
      <Separator />
      {customer.status === "REJECTED" ? (
        <RejectedMessage message={customer.message ?? ""} />
      ) : (
        <DocumentGrid customer={customer} openDocument={openDocument} />
      )}
      <Separator />
      <DocumentFooter
        customer={customer}
        isUpdating={isUpdating}
        handleApprove={handleApprove}
        state={state}
        setState={setState}
        handleReject={handleReject}
      />
    </div>
  );
};
