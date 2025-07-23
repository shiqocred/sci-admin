import { LabelInput } from "@/components/label-input";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import React from "react";

export const ProductCore = ({
  input,
  handleOnChange,
  disabled,
  setImagesProduct,
  imageOld,
  setImageOld,
}: {
  input: any;
  handleOnChange: any;
  disabled: boolean;
  setImagesProduct: React.Dispatch<React.SetStateAction<File[] | null>>;
  imageOld: string[];
  setImageOld: React.Dispatch<React.SetStateAction<string[]>>;
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
        <FileUpload
          onChange={(e) => setImagesProduct(e as File[])}
          imageOld={imageOld}
          setImageOld={(e: any) => setImageOld(e)}
        />
      </div>
    </div>
  );
};
