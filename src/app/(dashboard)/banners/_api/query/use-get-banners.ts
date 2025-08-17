import { PaginationMeta } from "@/lib/pagination/fastPaginate";
import { useApiQuery } from "@/lib/query/use-query";

export type BannerProps = {
  id: string;
  name: string;
  image: string | null;
  status: string;
  apply: string;
};

type Response = {
  data: {
    data: BannerProps[];
    pagination: PaginationMeta;
  };
};

export const useGetBanners = ({
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
    key: ["banners-list", { q, p, limit, sort, order }],
    endpoint: "/admin/banners",
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
