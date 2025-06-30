import { LabelInput } from "@/components/label-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import React from "react";

export const ProductCore = ({
  input,
  handleOnChange,
  disabled,
}: {
  input: any;
  handleOnChange: any;
  disabled: boolean;
}) => {
  return (
    <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-3">
      <LabelInput
        label="Title"
        placeholder="e.g. Obat Kutu Kucing"
        id="title"
        value={input.title}
        onChange={(e) => handleOnChange(e.target.id, e.target.value)}
        disabled={disabled}
      />
      <div className="flex flex-col gap-1.5 w-full">
        <Label>Images</Label>
        <Button
          className="w-full h-28 bg-transparent border-gray-300 border-dashed hover:bg-gray-100 hover:border-gray-400 shadow-none"
          variant={"outline"}
          disabled={disabled}
        >
          Upload Gambar
        </Button>
      </div>
    </div>
  );
};
