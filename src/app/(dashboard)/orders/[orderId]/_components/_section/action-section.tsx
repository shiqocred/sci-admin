import { Button } from "@/components/ui/button";
import React, { ReactNode } from "react";
import { OrderProps } from "../../_api";
import { CreditCard, Loader2, Truck, X } from "lucide-react";

export const ActionSection = ({
  orderData,
  isLoading,
  isCanceling,
  isPaying,
  isSending,
  handleCancel,
  handlePayment,
  handleSend,
}: {
  orderData: OrderProps | undefined;
  isLoading: boolean;
  isCanceling: boolean;
  isPaying: boolean;
  isSending: boolean;
  handleCancel: () => void;
  handlePayment: () => void;
  handleSend: () => void;
}) => {
  if (orderData?.status === "waiting payment") {
    return (
      <OrderActionButtons
        primaryLabel="Mark as Paid"
        primaryLoadingLabel="Paying..."
        primaryIcon={<CreditCard />}
        secondaryLabel="Cancel Order"
        secondaryLoadingLabel="Canceling..."
        secondaryIcon={<X />}
        isPrimaryLoading={isPaying}
        isSecondaryLoading={isCanceling}
        handlePrimary={handlePayment}
        handleSecondary={handleCancel}
        isLoading={isLoading}
      />
    );
  }
  if (orderData?.status === "processed") {
    return (
      <OrderActionButtons
        primaryLabel="Send Order"
        primaryLoadingLabel="Sending..."
        primaryIcon={<Truck />}
        secondaryLabel="Cancel Order"
        secondaryLoadingLabel="Canceling..."
        secondaryIcon={<X />}
        isPrimaryLoading={isSending}
        isSecondaryLoading={isCanceling}
        handlePrimary={handleSend}
        handleSecondary={handleCancel}
        isLoading={isLoading}
      />
    );
  }
  return null;
};

const OrderActionButtons = ({
  primaryLabel,
  primaryLoadingLabel,
  primaryIcon,
  secondaryLabel,
  secondaryLoadingLabel,
  secondaryIcon,
  isPrimaryLoading,
  isSecondaryLoading,
  handlePrimary,
  handleSecondary,
  isLoading,
}: {
  primaryLabel: string;
  primaryLoadingLabel: string;
  primaryIcon: ReactNode;
  secondaryLabel: string;
  secondaryLoadingLabel: string;
  secondaryIcon: ReactNode;
  isPrimaryLoading: boolean;
  isSecondaryLoading: boolean;
  handlePrimary: () => void;
  handleSecondary: () => void;
  isLoading: boolean;
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Button
        disabled={isLoading}
        className="col-span-1"
        variant={"outline"}
        onClick={handleSecondary}
      >
        {isSecondaryLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          secondaryIcon
        )}
        {isSecondaryLoading ? secondaryLoadingLabel : secondaryLabel}
      </Button>
      <Button
        disabled={isLoading}
        className="col-span-2"
        onClick={handlePrimary}
      >
        {isPrimaryLoading ? <Loader2 className="animate-spin" /> : primaryIcon}
        {isPrimaryLoading ? primaryLoadingLabel : primaryLabel}
      </Button>
    </div>
  );
};
