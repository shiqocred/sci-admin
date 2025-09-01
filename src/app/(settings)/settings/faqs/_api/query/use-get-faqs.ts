import { PaginationMeta } from "@/lib/pagination";
import { useApiQuery } from "@/lib/query/use-query";

export type FaqProps = {
  id: string;
  question: string;
  isFirst: boolean;
  isLast: boolean;
};

type Response = {
  data: {
    data: FaqProps[];
    pagination: PaginationMeta;
  };
};

type UseGetFaqsParams = {
  q?: string;
  p?: number;
  limit?: number;
  sort?: string;
  order?: string;
};

export const useGetFaqs = ({ q, p, limit, sort, order }: UseGetFaqsParams) => {
  const query = useApiQuery<Response>({
    key: ["faqs", { q, p, limit, sort, order }],
    endpoint: `/admin/settings/faqs`,
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
