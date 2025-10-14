import { useApiQuery } from "@/lib/query/use-query";

export type ProductExportProps = {
  suppliers: {
    value: string;
    label: string;
  }[];
  categories: {
    value: string;
    label: string;
  }[];
  pets: {
    value: string;
    label: string;
  }[];
};

type Response = {
  data: ProductExportProps;
};

export const useGetExportFilters = () => {
  return useApiQuery<Response>({
    key: ["product-export-filters"],
    endpoint: "/admin/products/export/filters",
  });
};
