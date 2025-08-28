import { LabelInput } from "@/components/label-input";
import { MessageInputError } from "@/components/message-input-error";
import { RichInput } from "@/components/rich-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, generateRandomNumber } from "@/lib/utils";
import { Plus, Trash2, X } from "lucide-react";
import React, { FormEvent, useState } from "react";
import { toast } from "sonner";

export const ProductDescription = ({
  input,
  handleOnChange,
  compositions,
  setCompositions,
  disabled,
  compositionItem,
  setCompositionItem,
  errors,
}: {
  input: any;
  handleOnChange: any;
  compositions: any;
  setCompositions: any;
  disabled: boolean;
  compositionItem: {
    name: string;
    value: string;
  };
  setCompositionItem: React.Dispatch<
    React.SetStateAction<{
      name: string;
      value: string;
    }>
  >;
  errors: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRemoveComposition = (id: string) => {
    setCompositions((prev: any) => prev.filter((c: any) => c.id !== id));
  };

  const handleAddComposition = (e: FormEvent) => {
    e.preventDefault();
    const isNameExists = compositions.some(
      (composition: any) =>
        composition.name.toLowerCase() === compositionItem.name.toLowerCase()
    );

    if (isNameExists) {
      toast.error("Composition name already exists!");
      return; // Hentikan eksekusi jika nama sudah ada
    }

    // Cek apakah name tidak kosong
    if (!compositionItem.name.trim()) {
      toast.error("Composition name is required!");
      return;
    }

    if (!compositionItem.value.trim()) {
      toast.error("Composition value is required!");
      return;
    }
    setCompositions((prev: any) => [
      ...prev,
      { id: generateRandomNumber(3), ...compositionItem },
    ]);
    setCompositionItem({ name: "", value: "" });
    setIsOpen(false);
  };

  return (
    <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
      <div className="flex flex-col gap-1.5 w-full">
        <Label className="required">Description</Label>
        <div className="flex flex-col w-full gap-1.5">
          <Textarea
            placeholder="e.g. FOURCIDE EMV is a combination..."
            className={cn(
              "focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none min-h-24 placeholder:text-xs",
              errors?.description && "border-red-500"
            )}
            id="description"
            value={input.description}
            onChange={(e) => handleOnChange(e.target.id, e.target.value)}
            disabled={disabled}
          />
          <MessageInputError error={errors?.description} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <Label>Indication</Label>
        <div className="flex flex-col w-full gap-1.5">
          <RichInput
            content={input.indication}
            onChange={(e) => handleOnChange("indication", e)}
            className={cn(errors?.indication && "border-red-500")}
            toolbarClassName={cn(errors?.indication && "border-red-500")}
            disabled={disabled}
          />
          <MessageInputError error={errors?.indication} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <Label>Dosage & Usage</Label>
        <div className="flex flex-col w-full gap-1.5">
          <RichInput
            content={input.dosageUsage}
            onChange={(e) => handleOnChange("dosageUsage", e)}
            className={cn(errors?.dosageUsage && "border-red-500")}
            toolbarClassName={cn(errors?.dosageUsage && "border-red-500")}
            disabled={disabled}
          />
          <MessageInputError error={errors?.dosageUsage} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <Label>Storage Instruction</Label>
        <div className="flex flex-col w-full gap-1.5">
          <Textarea
            placeholder="e.g. Stored at 23°C to 27°C..."
            className={cn(
              "focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none min-h-24 placeholder:text-xs",
              errors?.storageInstruction && "border-red-500"
            )}
            id="storageInstruction"
            value={input.storageInstruction}
            onChange={(e) => handleOnChange(e.target.id, e.target.value)}
            disabled={disabled}
          />
          <MessageInputError error={errors?.storageInstruction} />
        </div>
      </div>
      <div className="flex flex-col w-full gap-1.5">
        <LabelInput
          label="Packaging"
          id="packaging"
          placeholder="e.g. 1L and 5L"
          className={cn(
            errors?.packaging && "border-red-500 hover:border-red-500"
          )}
          value={input.packaging}
          onChange={(e) => handleOnChange(e.target.id, e.target.value)}
          disabled={disabled}
        />
        <MessageInputError error={errors?.packaging} />
      </div>
      <div className="flex flex-col w-full gap-1.5">
        <LabelInput
          label="Registration number"
          id="registrationNumber"
          placeholder="e.g. KEMENTAN RI No..."
          className={cn(
            errors?.registrationNumber && "border-red-500 hover:border-red-500"
          )}
          value={input.registrationNumber}
          onChange={(e) => handleOnChange(e.target.id, e.target.value)}
          disabled={disabled}
        />
        <MessageInputError error={errors?.registrationNumber} />
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <Label className="required">Composition</Label>
        <div
          className={cn(
            "border p-3 flex flex-col w-full rounded-md gap-2",
            errors?.compositions && "border-red-500"
          )}
        >
          {compositions.length > 0 && (
            <div className="flex items-center gap-2 border-b pb-1">
              <div className="w-full">
                <Label className="text-xs text-gray-500">Name</Label>
              </div>
              <div className="w-full">
                <Label className="text-xs text-gray-500">Value</Label>
              </div>
              <div className="w-9 flex-none" />
            </div>
          )}
          {compositions.map((item: any) => (
            <div key={item.id} className="flex items-center gap-2">
              <Input
                className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none disabled:opacity-100"
                value={item.name}
                disabled
              />
              <Input
                className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none disabled:opacity-100"
                value={item.value}
                disabled
              />
              <Button
                className="hover:bg-red-100 hover:text-red-500"
                variant={"ghost"}
                size={"icon"}
                onClick={() => handleRemoveComposition(item.id)}
                disabled={disabled}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>Add Composition</DialogTitle>
                <DialogDescription />
              </DialogHeader>
              <form
                onSubmit={handleAddComposition}
                className="flex flex-col w-full items-center gap-2"
              >
                <div className="flex flex-col gap-1.5 w-full">
                  <Label className="required">Name</Label>
                  <Input
                    placeholder="e.g. Vitamin A"
                    className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none placeholder:text-xs"
                    value={compositionItem.name}
                    onChange={(e) =>
                      setCompositionItem((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    disabled={disabled}
                  />
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <Label className="required">Value</Label>
                  <Input
                    placeholder="e.g. 1000 IU"
                    className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none placeholder:text-xs"
                    value={compositionItem.value}
                    onChange={(e) =>
                      setCompositionItem((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    disabled={disabled}
                  />
                </div>
                <DialogFooter className="grid-cols-3 grid w-full mt-3">
                  <Button
                    className="col-span-1 flex-auto"
                    variant={"outline"}
                    type="button"
                  >
                    <X />
                    Cancel
                  </Button>
                  <Button
                    className="col-span-2 flex-auto"
                    type="submit"
                    disabled={
                      disabled ||
                      !compositionItem.name ||
                      !compositionItem.value
                    }
                  >
                    <Plus />
                    Add Composition
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <MessageInputError error={errors?.compositions} />
      </div>
    </div>
  );
};
