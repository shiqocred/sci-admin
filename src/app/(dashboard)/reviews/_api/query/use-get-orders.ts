import { PaginationMeta } from "@/lib/pagination/fastPaginate";
import { useApiQuery } from "@/lib/query/use-query";

export type OrderResponse = {
  date: string;
  status:
    | "waiting payment"
    | "processed"
    | "shipping"
    | "delivered"
    | "expired"
    | "cancelled";
  id: string;
  total_price: string;
  total_item: number;
  user_name: string | null;
};

type Response = {
  data: {
    data: OrderResponse[];
    pagination: PaginationMeta;
  };
};

type UseGetOrdersParams = {
  q?: string;
  p?: number;
  limit?: number;
  sort?: string;
  order?: string;
};

export const useGetOrders = ({
  q,
  p,
  limit,
  sort,
  order,
}: UseGetOrdersParams) => {
  return useApiQuery<Response>({
    key: ["orders-list", { q, p, limit, sort, order }],
    endpoint: "/admin/orders",
    searchParams: {
      q,
      p,
      limit,
      sort,
      order,
    },
  });
};
