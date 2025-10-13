import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import React from "react";

export const ExportingDialog = () => {
  return (
    <Dialog open>
      <DialogContent showCloseButton={false} className="gap-0 w-xs h-40">
        <DialogHeader className="p-0 gap-0">
          <DialogTitle />
          <DialogDescription />
        </DialogHeader>
        <div className="flex flex-col gap-3 justify-center items-center text-center -mt-6">
          <Loader className="animate-spin size-6" />
          <p className="text-sm animate-pulse">
            Please wait, downloading data...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
