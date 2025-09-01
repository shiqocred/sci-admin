import { PaginationMeta } from "@/lib/pagination";
import { useApiQuery } from "@/lib/query/use-query";

export type AdminProps = {
  id: string;
  name: string;
  email: string;
};

type Response = {
  data: {
    data: AdminProps[];
    pagination: PaginationMeta;
  };
};

type UseGetAccountsParams = {
  q?: string;
  p?: number;
  limit?: number;
  sort?: string;
  order?: string;
};

export const useGetAccounts = ({
  q,
  p,
  limit,
  sort,
  order,
}: UseGetAccountsParams) => {
  const query = useApiQuery<Response>({
    key: ["accounts", { q, p, limit, sort, order }],
    endpoint: `/admin/settings/accounts`,
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
