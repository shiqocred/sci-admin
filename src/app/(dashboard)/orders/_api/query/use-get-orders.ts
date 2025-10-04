import { PaginationMeta } from "@/lib/pagination/fastPaginate";
import { useApiQuery } from "@/lib/query/use-query";

export type OrderResponse = {
  date: string | null;
  status:
    | "waiting-payment"
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

export type CurrentProps = {
  minDate: Date;
  maxDate: Date;
  minPrice: number;
  maxPrice: number;
  minProduct: number;
  maxProduct: number;
};

export type OptionProps = CurrentProps & {
  customers: {
    id: string;
    name: string;
  }[];
};

type Response = {
  data: {
    data: OrderResponse[];
    pagination: PaginationMeta;
    option: OptionProps;
    current: CurrentProps;
  };
};

type UseGetOrdersParams = {
  q?: string;
  p?: number;
  limit?: number;
  sort?: string;
  order?: string;
  userId: string[];
  status: string[];
  minPrice: string;
  maxPrice: string;
  minProduct: string;
  maxProduct: string;
  minDate: string;
  maxDate: string;
};

export const useGetOrders = ({
  q,
  p,
  limit,
  sort,
  order,
  userId,
  status,
  minPrice,
  maxPrice,
  minProduct,
  maxProduct,
  minDate,
  maxDate,
}: UseGetOrdersParams) => {
  return useApiQuery<Response>({
    key: [
      "orders-list",
      {
        q,
        p,
        limit,
        sort,
        order,
        userId,
        status,
        minPrice,
        maxPrice,
        minProduct,
        maxProduct,
        minDate,
        maxDate,
      },
    ],
    endpoint: "/admin/orders",
    searchParams: {
      q,
      p,
      limit,
      sort,
      order,
      userId,
      status,
      minPrice,
      maxPrice,
      minProduct,
      maxProduct,
      minDate,
      maxDate,
    },
  });
};
