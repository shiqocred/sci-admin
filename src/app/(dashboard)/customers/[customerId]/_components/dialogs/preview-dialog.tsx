import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type PreviewDialogProps = {
  open: string;
  setOpen: (v: string) => void;
  url: string;
  setUrl: (v: string) => void;
};

export const PreviewDialog = ({
  open,
  setOpen,
  url,
  setUrl,
}: PreviewDialogProps) => {
  const handleClose = () => {
    setOpen("");
    setUrl("/images/logo-sci.png");
  };

  return (
    <Dialog
      open={!!open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent showCloseButton={false} className="min-w-5xl">
        <DialogHeader>
          <DialogTitle>{open} File</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="aspect-[107/67] w-full relative shadow rounded-md overflow-hidden">
          <Image src={url} fill alt="storefront" />
        </div>
        <DialogFooter>
          <Button variant={"outline"} onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
