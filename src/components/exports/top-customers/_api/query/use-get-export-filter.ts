import { useApiQuery } from "@/lib/query/use-query";

export type CustomerExportProps = {
  suppliers: {
    value: string;
    label: string;
  }[];
  products: {
    value: string;
    label: string;
  }[];
};

type Response = {
  data: CustomerExportProps;
};

export const useGetExportFilters = () => {
  return useApiQuery<Response>({
    key: ["customer-export-filters"],
    endpoint: "/admin/customers/export/filters",
  });
};
