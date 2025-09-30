import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const RejectDialog = ({
  isOpen,
  setIsOpen,
  loading,
  input,
  setInput,
  handleReject,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  loading: boolean;
  input: string;
  setInput: (v: string) => void;
  handleReject: () => void;
}) => {
  const handleClose = () => {
    setIsOpen(false);
    setInput("");
  };
  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        if (isOpen) {
          handleClose();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size={"sm"}
          className="text-xs bg-red-300 text-black hover:bg-red-400"
          disabled={loading}
        >
          <XCircle className="size-3.5" />
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Reject Document</DialogTitle>
          <DialogDescription>This action cannot be undone</DialogDescription>
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
          <Button variant={"outline"} onClick={handleClose}>
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
  );
};
