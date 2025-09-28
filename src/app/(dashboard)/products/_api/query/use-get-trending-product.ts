import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    id: string;
    name: string;
    image: string | null;
    position: string | null;
  }[];
};

type UseGetProductsParams = {
  q?: string;
};

export const useGetProductTrendings = ({ q }: UseGetProductsParams) => {
  return useApiQuery<Response>({
    key: ["product-trendings-list", { q }],
    endpoint: "/admin/product-trendings",
    searchParams: {
      q,
    },
  });
};
