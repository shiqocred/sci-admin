import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    customers: {
      value: string;
      label: string;
    }[];
    products: {
      value: string;
      label: string;
    }[];
  };
};

export const useGetExportFilters = () => {
  return useApiQuery<Response>({
    key: ["export-filters"],
    endpoint: "/admin/orders/export/filters",
  });
};
