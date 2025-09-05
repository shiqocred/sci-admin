import { PaginationMeta } from "@/lib/pagination/fastPaginate";
import { useApiQuery } from "@/lib/query/use-query";

export type DiscountsProps = {
  id: string;
  code: string;
  applyType: "categories" | "suppliers" | "pets" | "products";
  valueType: "fixed" | "percentage";
  value: string;
  eligibilityType: "user" | "role" | null;
  eligibility: number | null;
  totalApply: number;
  status: "active" | "expired" | "scheduled";
};

type Response = {
  data: {
    data: DiscountsProps[];
    pagination: PaginationMeta;
  };
};

export const useGetDiscounts = ({
  q,
  p,
  limit,
  sort,
  order,
}: {
  q: string;
  p: number;
  limit: number;
  sort: string;
  order: string;
}) => {
  const query = useApiQuery<Response>({
    key: ["discounts-list", { q, p, limit, sort, order }],
    endpoint: "/admin/discounts",
    searchParams: {
      q,
      p,
      limit,
      sort,
      order,
    },
  });
  return query;
};
