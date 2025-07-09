import { PaginationMeta } from "@/lib/pagination/fastPaginate";
import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    data: {
      id: string;
      name: string | null;
      email: string | null;
      phoneNumber: string | null;
    }[];
    pagination: PaginationMeta;
  };
};

export const useGetCustomers = ({
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
    key: ["customers-list", { q, p, limit, sort, order }],
    endpoint: "/admin/customers",
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
