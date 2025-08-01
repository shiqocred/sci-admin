import {
  ChartNoAxesGanttIcon,
  PawPrint,
  StoreIcon,
  TagIcon,
} from "lucide-react";
import React from "react";
import {
  ListProductVariantSelected,
  ListSelected,
} from "./_sub-sub-section/list-selected";
import { InputProps } from "../../client";
import { SelectProduct } from "../discount-core";

interface ValueSelect {
  name: string;
  id: string;
}

interface SelectedProps {
  input: InputProps;
  apply: string;
  categories: ValueSelect[];
  handleRemoveApply: (item: any) => void;
  suppliers: ValueSelect[];
  pets: ValueSelect[];
  selectProducts: SelectProduct | undefined;
}

export const Selected = ({
  input,
  apply,
  categories,
  handleRemoveApply,
  suppliers,
  pets,
  selectProducts,
}: SelectedProps) => {
  return (
    <div className="flex flex-col border rounded-md divide-y overflow-hidden">
      {apply === "categories" &&
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
      {apply === "suppliers" &&
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
      {apply === "pets" &&
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
      {apply === "products" &&
        filterSelectedProducts(selectProducts?.data ?? [], input.selected).map(
          (item) => {
            if (item.default_variant) {
              return (
                <ListSelected
                  key={item.id}
                  icon={ChartNoAxesGanttIcon}
                  handleRemoveApply={() =>
                    handleRemoveApply(item.default_variant.id)
                  }
                  item={item}
                />
              );
            } else {
              return (
                <ListProductVariantSelected
                  key={item.id}
                  item={item}
                  icon={ChartNoAxesGanttIcon}
                  handleRemoveApply={handleRemoveApply}
                />
              );
            }
          }
        )}
    </div>
  );
};

function filterSelectedProducts(products: any[], selected: string[]) {
  return products
    .map((product) => {
      const matchedDefault =
        product.default_variant && selected.includes(product.default_variant.id)
          ? product.default_variant
          : null;

      const matchedVariants =
        product.variants?.filter((variant: any) =>
          selected.includes(variant.id)
        ) ?? [];

      // kalau tidak ada default maupun variant yang match, skip
      if (!matchedDefault && matchedVariants.length === 0) return null;

      return {
        ...product,
        default_variant: matchedDefault,
        variants: matchedVariants.length > 0 ? matchedVariants : null,
      };
    })
    .filter(Boolean); // buang yang null
}
