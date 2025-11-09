import {
  BadgePercent,
  ChartNoAxesGanttIcon,
  PawPrint,
  StoreIcon,
  TagIcon,
} from "lucide-react";
import React, { Dispatch, SetStateAction } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetSelects } from "../../_api";
import { SelectApply } from "./select-apply";
import { Label } from "@/components/ui/label";
import { LabelInput } from "@/components/label-input";
import { FileUploadBanner } from "@/components/ui/file-upload-banner";
import { ListSelected } from "./_sub-section/list-selected";

interface BannerCoreProps {
  input: any;
  setInput: Dispatch<SetStateAction<any>>;
}

export const BannerCore = ({ input, setInput }: BannerCoreProps) => {
  const { data } = useGetSelects();

  const selects = React.useMemo(() => {
    const res = data?.data;
    return {
      categories: res?.categories ?? [],
      suppliers: res?.suppliers ?? [],
      pets: res?.pets ?? [],
      products: res?.products ?? [],
      promos: res?.promos ?? [],
    };
  }, [data]);

  const handleRemoveApply = (itemId: any) => {
    setInput((prev: any) => ({
      ...prev,
      selected:
        prev.apply === "detail"
          ? []
          : prev.selected.filter((id: any) => id !== itemId),
    }));
  };

  const handleSelectApply = (item: any) => {
    const { id } = item;
    setInput((prev: any) => {
      const isSelected = prev.selected.includes(id);
      if (prev.apply === "detail") return { ...prev, selected: [id] };
      return {
        ...prev,
        selected: isSelected
          ? prev.selected.filter((i: any) => i !== id)
          : [...prev.selected, id],
      };
    });
  };

  const renderSelectedList = () => {
    const applyMap: Record<string, { data: any[]; icon: any }> = {
      categories: { data: selects.categories, icon: TagIcon },
      suppliers: { data: selects.suppliers, icon: StoreIcon },
      pets: { data: selects.pets, icon: PawPrint },
      detail: { data: selects.products, icon: ChartNoAxesGanttIcon },
      promos: { data: selects.promos, icon: BadgePercent },
    };

    const current = applyMap[input.apply];
    if (!current) return null;

    return current.data
      .filter((item) => input.selected.includes(item.id))
      .map((item) => (
        <ListSelected
          key={item.id}
          icon={current.icon}
          handleRemoveApply={() => handleRemoveApply(item.id)}
          item={item}
        />
      ));
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-5">
      <LabelInput
        label="Name"
        placeholder="Type banner name..."
        classLabel="required"
        value={input.name}
        onChange={(e) =>
          setInput((prev: any) => ({ ...prev, name: e.target.value }))
        }
      />

      <div className="flex flex-col gap-1.5">
        <Label className="required">Upload Image</Label>
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

      <div className="flex flex-col gap-1.5">
        <Label className="required">Type Banner</Label>
        <Select
          value={input.apply}
          onValueChange={(val) =>
            setInput((prev: any) => ({
              ...prev,
              selected: [],
              apply: val as
                | "detail"
                | "categories"
                | "suppliers"
                | "pets"
                | "promos",
            }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose type banner..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="detail">Product Detail</SelectItem>
              <SelectItem value="pets">Pets List</SelectItem>
              <SelectItem value="suppliers">Suppliers List</SelectItem>
              <SelectItem value="categories">Categories List</SelectItem>
              <SelectItem value="promos">Promos List</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <SelectApply
        {...selects}
        input={input}
        handleSelectApply={handleSelectApply}
      />

      {input.selected.length > 0 && (
        <div className="flex flex-col divide-y overflow-hidden rounded-md border">
          {renderSelectedList()}
        </div>
      )}
    </div>
  );
};
