import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatRole, formatRupiah, pronoun } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { format } from "date-fns";
import { CheckCircle, CircleQuestionMark } from "lucide-react";
import Image from "next/image";
import React, { memo } from "react";
import { Customer } from "../../_api";

type DataCustomerProps = {
  customer: Customer;
  handleVerify: () => Promise<void>;
  loading: boolean;
};

const InfoItem = ({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: React.ReactNode;
  tooltip?: string;
}) => (
  <div className="flex flex-col gap-0.5 group cursor-default">
    <div className="flex items-center gap-1 text-xs text-gray-500">
      <p>{label}</p>
      {tooltip && (
        <TooltipText value={tooltip}>
          <CircleQuestionMark className="size-3" />
        </TooltipText>
      )}
    </div>
    <p className="text-sm font-medium group-hover:underline">{value}</p>
  </div>
);

export const DataCustomer = memo(function DataCustomer({
  customer,
  handleVerify,
  loading,
}: DataCustomerProps) {
  const {
    name,
    image,
    email,
    emailVerified,
    phoneNumber,
    role,
    totalOrder,
    totalAmount,
    lastOrder,
    createdAt,
  } = customer;

  return (
    <div className="flex flex-col rounded-lg border border-gray-300">
      <div className="flex items-center gap-4 px-5 py-3">
        <div className="relative size-10 rounded-md overflow-hidden shadow">
          <Image
            src={image ?? "/images/logo-sci.png"}
            fill
            alt={name}
            className="object-cover"
          />
        </div>
        <h3 className="text-xl font-semibold">{name}</h3>
      </div>

      <Separator />

      <div className="grid grid-cols-3 gap-4 px-5 py-3">
        <div className="flex flex-col gap-0.5 group cursor-default">
          <p className="text-xs text-gray-500">Email</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium group-hover:underline">{email}</p>
            {emailVerified ? (
              <TooltipText value="Email verified">
                <CheckCircle className="size-3 text-green-600" />
              </TooltipText>
            ) : (
              <Button
                onClick={handleVerify}
                className="h-5 px-2 py-0 text-[10px] hover:bg-gray-700"
                disabled={loading}
              >
                Verify
              </Button>
            )}
          </div>
        </div>

        <InfoItem label="Phone" value={phoneNumber || "-"} />
        <InfoItem label="Role" value={role ? formatRole(role) : "-"} />
        <InfoItem
          label="Total Order"
          tooltip="Summary of delivered orders"
          value={
            <>
              {totalOrder} Order{pronoun(totalOrder)}{" "}
              <span className="text-xs text-gray-500">
                ({formatRupiah(totalAmount)})
              </span>
            </>
          }
        />
        <InfoItem
          label="Last Order"
          value={lastOrder ? format(new Date(lastOrder), "PP 'at' HH:mm") : "-"}
        />
        <InfoItem
          label="Joined at"
          value={createdAt ? format(new Date(createdAt), "PP 'at' HH:mm") : "-"}
        />
      </div>
    </div>
  );
});
