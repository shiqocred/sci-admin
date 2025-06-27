import { PaginationMeta } from "@/lib/pagination/fastPaginate";
import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    data: {
      id: string;
      name: string;
      slug: string;
    }[];
    pagination: PaginationMeta;
  };
};

export const useGetCategories = ({
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
    key: ["categories-list", { q, p, limit, sort, order }],
    endpoint: "/admin/categories",
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
