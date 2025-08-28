import { Button } from "@/components/ui/button";
import { checkedFormat, cn, formatRupiah, pronoun } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import React, { MouseEvent, useMemo } from "react";
import { InputProps } from "../client";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface DiscountSummaryProps {
  input: InputProps;
  apply: string;
  eligibility: string;
  minimumReq: string;
  limitOnce: string;
  dateStart: Date | undefined;
  endDate: string;
  dateEnd: Date | undefined;
  handleCreate: (e: MouseEvent) => void;
  isDisabled: boolean;
  status?: "active" | "expired" | "scheduled";
}

export const DiscountSummary = ({
  status,
  input,
  apply,
  eligibility,
  minimumReq,
  limitOnce,
  dateStart,
  endDate,
  dateEnd,
  handleCreate,
  isDisabled,
}: DiscountSummaryProps) => {
  const { freeShippingId } = useParams();

  // Memoize active date description
  const activeDateText = useMemo(() => {
    if (!dateStart) return "";

    const isTodayStart =
      new Date().setHours(0, 0, 0, 0) ===
      new Date(dateStart).setHours(0, 0, 0, 0);
    const isTodayEnd = dateEnd
      ? new Date().setHours(0, 0, 0, 0) ===
        new Date(dateEnd).setHours(0, 0, 0, 0)
      : false;
    const isSameDate =
      dateEnd && !isTodayStart
        ? new Date(dateStart).setHours(0, 0, 0, 0) ===
          new Date(dateEnd).setHours(0, 0, 0, 0)
        : false;
    const hasEndDate = checkedFormat(endDate) && dateEnd;

    if (!hasEndDate) {
      return isTodayStart
        ? "Active from today"
        : `Active from ${format(dateStart, "PP", { locale: id })}`;
    }

    if (isTodayStart && isTodayEnd) return "Active today";
    if (isTodayStart)
      return `Active from today to ${format(dateEnd, "PP", { locale: id })}`;
    if (isTodayEnd)
      return `Active from ${format(dateStart, "PP", { locale: id })} to today`;

    if (isSameDate) {
      return `Active ${format(dateStart, "PP", { locale: id })}`;
    }

    return `Active from ${format(dateStart, "PP", { locale: id })} to ${format(dateEnd, "PP", { locale: id })}`;
  }, [dateStart, endDate, dateEnd]);

  // Memoize usage limit text
  const usageText = useMemo(() => {
    const useCount = parseFloat(input.use);
    const isLimitOnce = checkedFormat(limitOnce);

    if (!isLimitOnce && useCount <= 0) return "No limit usage";
    if (isLimitOnce && useCount <= 0) return "One use per customer";

    let text = "";
    if (useCount > 0) {
      text = `Limit of ${useCount} use${pronoun(useCount)}`;
    }
    if (isLimitOnce) {
      text += (text ? " and " : "") + "one use per customer";
    }
    return text;
  }, [input.use, limitOnce]);

  // Memoize eligibility text
  const eligibilityText = useMemo(() => {
    if (eligibility === "all") return "For all customers";
    if (eligibility === "role" && input.role.length > 0) {
      if (input.role.length === 3) {
        return "For all customers";
      }
      return `For ${input.role.map((r) => (r === "BASIC" && "Pet Owner") || (r === "PETSHOP" && "Pet Shop") || (r === "VETERINARIAN" && "Vet Clinic")).join(", ")}`;
    }
    if (eligibility === "user" && input.userId.length > 0) {
      return `For ${input.userId.length} User${pronoun(input.userId.length)}`;
    }
    return null;
  }, [eligibility, input.role, input.userId]);

  // Memoize minimum requirement text
  const minimumText = useMemo(() => {
    if (minimumReq === "nothing") return "No minimum purchase requirement";
    if (minimumReq === "amount" && parseFloat(input.purchase) > 0) {
      return `Minimum purchase of ${formatRupiah(input.purchase)}`;
    }
    if (minimumReq === "quantity" && parseFloat(input.quantity) > 0) {
      return `Minimum purchase of ${parseFloat(input.quantity).toLocaleString()} items`;
    }
    return null;
  }, [minimumReq, input.purchase, input.quantity]);

  return (
    <div className="flex flex-col gap-4 sticky top-4">
      <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
        {/* Voucher Code */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-700">
                Free shipping for {input.selected.length}{" "}
                <span className="capitalize">{apply}</span>
              </p>
            </div>
            {status && freeShippingId && (
              <Badge
                className={cn(
                  "capitalize text-black font-medium",
                  status === "active" && "bg-green-300",
                  status === "scheduled" && "bg-yellow-300",
                  status === "expired" && "bg-gray-300"
                )}
              >
                {status}
              </Badge>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-1">
          <h5 className="text-sm font-semibold">Details</h5>
          <ul className="list-disc ml-3 space-y-0.5 text-xs text-gray-700">
            {eligibilityText && <li>{eligibilityText}</li>}
            {minimumText && <li>{minimumText}</li>}
            {usageText && <li>{usageText}</li>}
            {activeDateText && <li>{activeDateText}</li>}
          </ul>
        </div>
      </div>

      <Button onClick={handleCreate} disabled={isDisabled}>
        {freeShippingId ? "Update" : "Submit"}
      </Button>
    </div>
  );
};
