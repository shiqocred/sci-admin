import { PaginationMeta } from "@/lib/pagination/fastPaginate";
import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    data: {
      id: string;
      name: string;
      slug: string;
      image: string | null;
      products: string;
    }[];
    pagination: PaginationMeta;
  };
};

export const useGetSuppliers = ({
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
    key: ["suppliers-list", { q, p, limit, sort, order }],
    endpoint: "/admin/suppliers",
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
