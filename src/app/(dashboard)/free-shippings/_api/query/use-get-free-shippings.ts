import { PaginationMeta } from "@/lib/pagination/fastPaginate";
import { useApiQuery } from "@/lib/query/use-query";

export type FreeShippingsProps = {
  id: string;
  name: string;
  eligibility: string;
  apply: string;
  status: "active" | "expired" | "scheduled";
};

type Response = {
  data: {
    data: FreeShippingsProps[];
    pagination: PaginationMeta;
  };
};

export const useGetFreeShippings = ({
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
    key: ["free-shippings-list", { q, p, limit, sort, order }],
    endpoint: "/admin/free-shippings",
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
