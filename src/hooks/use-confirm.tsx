"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState, JSX } from "react";

export const useConfirm = (
  title: string,
  message: string,
  variant: ButtonProps["variant"] = "default"
): [() => JSX.Element, () => Promise<unknown>] => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () => {
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => (
    <Dialog open={promise !== null} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="w-full sm:max-w-lg border-none overflow-y-auto  hide-scrollbar max-w-[85vh]"
      >
        <DialogHeader className="p-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <div className="w-full pt-4 flex items-center flex-col gap-y-2 lg:flex-row gap-x-2 justify-end">
          <Button
            className="w-full lg:w-auto"
            variant={"outline"}
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </Button>
          <Button
            className="w-full lg:w-auto"
            variant={variant}
            onClick={handleConfirm}
            type="button"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return [ConfirmationDialog, confirm];
};
