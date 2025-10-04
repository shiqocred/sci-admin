import { PaginationMeta } from "@/lib/pagination/fastPaginate";
import { useApiQuery } from "@/lib/query/use-query";

export type TestimoniesResponse = {
  rating: number;
  id: string;
  title: string;
  status: boolean;
  user: string | null;
};

export type CustomersProps = {
  id: string;
  name: string;
};
export type CurrentProps = {
  minRating: number;
  maxRating: number;
};
export type OptionProps = {
  customers: CustomersProps[];
};

type Response = {
  data: {
    data: TestimoniesResponse[];
    pagination: PaginationMeta;
    options: OptionProps;
    current: CurrentProps;
  };
};

type UseGetReviewParams = {
  q?: string;
  p?: number;
  limit?: number;
  sort?: string;
  order?: string;
  userId?: string[];
  status?: string;
  minRating?: string;
  maxRating?: string;
};

export const useGetReviews = ({
  q,
  p,
  limit,
  sort,
  order,
  userId,
  status,
  minRating,
  maxRating,
}: UseGetReviewParams) => {
  return useApiQuery<Response>({
    key: [
      "reviews-list",
      { q, p, limit, sort, order, userId, status, minRating, maxRating },
    ],
    endpoint: "/admin/reviews",
    searchParams: {
      q,
      p,
      limit,
      sort,
      order,
      userId,
      status,
      minRating,
      maxRating,
    },
  });
};
