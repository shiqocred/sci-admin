import { useApiQuery } from "@/lib/query/use-query";

export type OrderExportProps = {
  customers: {
    value: string;
    label: string;
  }[];
  products: {
    value: string;
    label: string;
  }[];
};

type Response = {
  data: OrderExportProps;
};

export const useGetExportFilters = () => {
  return useApiQuery<Response>({
    key: ["order-export-filters"],
    endpoint: "/admin/orders/export/filters",
  });
};
