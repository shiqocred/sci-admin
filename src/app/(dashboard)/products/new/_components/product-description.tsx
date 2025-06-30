import { LabelInput } from "@/components/label-input";
import { RichInput } from "@/components/rich-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateRandomNumber } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import React, { FormEvent, useRef, useState } from "react";

export const ProductDescription = ({
  input,
  handleOnChange,
  compositions,
  setCompositions,
  disabled,
}: {
  input: any;
  handleOnChange: any;
  compositions: any;
  setCompositions: any;
  disabled: boolean;
}) => {
  const inputCompositionRef = useRef<HTMLInputElement | null>(null);
  const [compositionItem, setCompositionItem] = useState({
    name: "",
    value: "",
  });

  const handleRemoveComposition = (id: string) => {
    setCompositions((prev: any) => prev.filter((c: any) => c.id !== id));
  };

  const handleAddComposition = (e: FormEvent) => {
    e.preventDefault();
    setCompositions((prev: any) => [
      ...prev,
      { id: generateRandomNumber(3), ...compositionItem },
    ]);
    setCompositionItem({ name: "", value: "" });
    if (inputCompositionRef.current) {
      inputCompositionRef.current.focus();
    }
  };

  return (
    <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
      <div className="flex flex-col gap-1.5 w-full">
        <Label>Description</Label>
        <Textarea
          placeholder="e.g. FOURCIDE EMV is a combination..."
          className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none min-h-24 placeholder:text-xs"
          id="description"
          value={input.description}
          onChange={(e) => handleOnChange(e.target.id, e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <Label>Indication</Label>
        <RichInput
          content={input.indication}
          onChange={(e) => handleOnChange("indication", e)}
          disabled={disabled}
        />
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <Label>Dosage & Usage</Label>
        <RichInput
          content={input.dosageUsage}
          onChange={(e) => handleOnChange("dosageUsage", e)}
          disabled={disabled}
          placeholder="e.g. - data"
        />
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <Label>Storage Instruction</Label>
        <Textarea
          placeholder="e.g. Stored at 23°C to 27°C..."
          className="focus-visible:ring-0 border-gray-300 focus-visible:border-gray-500 shadow-none min-h-24 placeholder:text-xs"
          id="storageInstruction"
          value={input.storageInstruction}
          onChange={(e) => handleOnChange(e.target.id, e.target.value)}
          disabled={disabled}
        />
      </div>
      <LabelInput
        label="Packaging"
        id="packaging"
        placeholder="e.g. 1L and 5L"
        value={input.packaging}
        onChange={(e) => handleOnChange(e.target.id, e.target.value)}
        disabled={disabled}
      />
      <LabelInput
        label="Registration number"
        id="registrationNumber"
        placeholder="e.g. KEMENTAN RI No..."
        value={input.registrationNumber}
        onChange={(e) => handleOnChange(e.target.id, e.target.value)}
        disabled={disabled}
      />
      <div className="flex flex-col gap-1.5 w-full">
        <Label>Composition</Label>
        <div className="border p-3 flex flex-col w-full rounded-md gap-2">
          <div className="flex items-center gap-2 border-b pb-1">
            <div className="w-full">
              <Label className="text-xs text-gray-500">Name</Label>
            </div>
            <div className="w-full">
              <Label className="text-xs text-gray-500">Value</Label>
            </div>
            <div className="w-9 flex-none" />
          </div>
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
          <form
            onSubmit={handleAddComposition}
            className="flex items-center gap-2"
          >
            <Input
              ref={inputCompositionRef}
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
            <Button
              className="hover:bg-gray-200"
              variant={"ghost"}
              size={"icon"}
              type="submit"
              disabled={disabled}
            >
              <Plus />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
