import { PaginationMeta } from "@/lib/pagination/fastPaginate";
import { useApiQuery } from "@/lib/query/use-query";

export type TestimoniesResponse = {
  rating: number;
  id: string;
  title: string;
  status: boolean;
  user: string | null;
};

type Response = {
  data: {
    data: TestimoniesResponse[];
    pagination: PaginationMeta;
  };
};

type UseGetReviewParams = {
  q?: string;
  p?: number;
  limit?: number;
  sort?: string;
  order?: string;
};

export const useGetReviews = ({
  q,
  p,
  limit,
  sort,
  order,
}: UseGetReviewParams) => {
  return useApiQuery<Response>({
    key: ["reviews-list", { q, p, limit, sort, order }],
    endpoint: "/admin/reviews",
    searchParams: {
      q,
      p,
      limit,
      sort,
      order,
    },
  });
};
