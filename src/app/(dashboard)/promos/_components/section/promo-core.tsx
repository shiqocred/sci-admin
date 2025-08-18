import { LabelInput } from "@/components/label-input";
import { FileUploadBanner } from "@/components/ui/file-upload-banner";
import { Label } from "@/components/ui/label";
import React, { Dispatch, SetStateAction } from "react";
import { ListSelected } from "./_sub-section/list-selected";
import { useGetSelects } from "../../_api";
import { SelectApply } from "./select-apply";

export const PromoCore = ({
  input,
  setInput,
}: {
  input: any;
  setInput: Dispatch<SetStateAction<any>>;
}) => {
  const { data } = useGetSelects();

  const products = React.useMemo(() => {
    return data?.data ?? [];
  }, [data]);

  const handleRemoveApply = (item: any) => {
    if (input.apply === "detail") {
      setInput((prev: any) => ({ ...prev, selected: [] }));
    } else {
      setInput((prev: any) => ({
        ...prev,
        selected: prev.selected.filter((i: any) => i !== item),
      }));
    }
  };
  const handleSelectApply = (item: any) => {
    if (input.apply === "detail") {
      setInput((prev: any) => ({ ...prev, selected: [item.id] }));
    } else {
      if (input.selected.includes(item.id)) {
        handleRemoveApply(item.id);
      } else {
        setInput((prev: any) => ({
          ...prev,
          selected: [...prev.selected, item.id],
        }));
      }
    }
  };
  return (
    <div className="bg-gray-50 border-gray-200 border p-5 rounded-lg flex flex-col gap-4">
      <LabelInput
        label="Name"
        placeholder="Type promo name..."
        value={input.name}
        onChange={(e) =>
          setInput((prev: any) => ({ ...prev, name: e.target.value }))
        }
      />
      <div className="flex flex-col gap-1.5">
        <Label>Upload Image</Label>
        <FileUploadBanner
          onChange={(e) =>
            setInput((prev: any) => ({ ...prev, image: e as File }))
          }
          imageOld={input.imageOld}
          setImageOld={(e) =>
            setInput((prev: any) => ({ ...prev, imageOld: e as string }))
          }
        />
        <p className="text-xs text-gray-500">*Recommended ratio 21:10</p>
      </div>
      <SelectApply
        handleSelectApply={handleSelectApply}
        input={input}
        products={products}
      />
      {input.selected.length > 0 && (
        <div className="flex flex-col border rounded-md divide-y overflow-hidden">
          {products
            .filter((item) => input.selected.includes(item.id))
            .map((item) => (
              <ListSelected
                key={item.id}
                handleRemoveApply={() => handleRemoveApply(item.id)}
                item={item}
              />
            ))}
        </div>
      )}
    </div>
  );
};
