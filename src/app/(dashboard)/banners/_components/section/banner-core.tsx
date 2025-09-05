import { LabelInput } from "@/components/label-input";
import { FileUploadBanner } from "@/components/ui/file-upload-banner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { Dispatch, SetStateAction } from "react";
import { ListSelected } from "./_sub-section/list-selected";
import { useGetSelects } from "../../_api";
import { SelectApply } from "./select-apply";
import {
  BadgePercent,
  ChartNoAxesGanttIcon,
  PawPrint,
  StoreIcon,
  TagIcon,
} from "lucide-react";

export const BannerCore = ({
  input,
  setInput,
}: {
  input: any;
  setInput: Dispatch<SetStateAction<any>>;
}) => {
  const { data } = useGetSelects();
  const categories = React.useMemo(() => {
    return data?.data.categories ?? [];
  }, [data]);
  const suppliers = React.useMemo(() => {
    return data?.data.suppliers ?? [];
  }, [data]);
  const pets = React.useMemo(() => {
    return data?.data.pets ?? [];
  }, [data]);
  const products = React.useMemo(() => {
    return data?.data.products ?? [];
  }, [data]);
  const promos = React.useMemo(() => {
    return data?.data.promos ?? [];
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
          onValueChange={(e) =>
            setInput((prev: any) => ({
              ...prev,
              selected: [],
              apply: e as
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
        categories={categories}
        handleSelectApply={handleSelectApply}
        input={input}
        pets={pets}
        products={products}
        promos={promos}
        suppliers={suppliers}
      />
      {input.selected.length > 0 && (
        <div className="flex flex-col border rounded-md divide-y overflow-hidden">
          {input.apply === "categories" &&
            categories
              .filter((item) => input.selected.includes(item.id))
              .map((item) => (
                <ListSelected
                  key={item.id}
                  icon={TagIcon}
                  handleRemoveApply={() => handleRemoveApply(item.id)}
                  item={item}
                />
              ))}
          {input.apply === "suppliers" &&
            suppliers
              .filter((item) => input.selected.includes(item.id))
              .map((item) => (
                <ListSelected
                  key={item.id}
                  icon={StoreIcon}
                  handleRemoveApply={() => handleRemoveApply(item.id)}
                  item={item}
                />
              ))}
          {input.apply === "pets" &&
            pets
              .filter((item) => input.selected.includes(item.id))
              .map((item) => (
                <ListSelected
                  key={item.id}
                  icon={PawPrint}
                  handleRemoveApply={() => handleRemoveApply(item.id)}
                  item={item}
                />
              ))}
          {input.apply === "detail" &&
            products
              .filter((item) => input.selected.includes(item.id))
              .map((item) => (
                <ListSelected
                  key={item.id}
                  icon={ChartNoAxesGanttIcon}
                  handleRemoveApply={() => handleRemoveApply(item.id)}
                  item={item}
                />
              ))}
          {input.apply === "promos" &&
            promos
              .filter((item) => input.selected.includes(item.id))
              .map((item) => (
                <ListSelected
                  key={item.id}
                  icon={BadgePercent}
                  handleRemoveApply={() => handleRemoveApply(item.id)}
                  item={item}
                />
              ))}
        </div>
      )}
    </div>
  );
};
