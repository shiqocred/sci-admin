import { PaginationMeta } from "@/lib/pagination/fastPaginate";
import { useApiQuery } from "@/lib/query/use-query";

export type PromoProps = {
  id: string;
  name: string;
  image: string | null;
  status: string;
  totalMount: string;
};

type Response = {
  data: {
    data: PromoProps[];
    pagination: PaginationMeta;
  };
};

export const useGetPromos = ({
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
    key: ["promos-list", { q, p, limit, sort, order }],
    endpoint: "/admin/promos",
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
