import { PaginationMeta } from "@/lib/pagination/fastPaginate";
import { useApiQuery } from "@/lib/query/use-query";

export type OptionProps = {
  minOrder: string;
  maxOrder: string;
  minSpent: string;
  maxSpent: string;
};

type Response = {
  data: {
    data: {
      id: string;
      name: string | null;
      email: string | null;
      phoneNumber: string | null;
    }[];
    pagination: PaginationMeta;
    option: OptionProps;
    current: OptionProps;
  };
};

export const useGetCustomers = ({
  q,
  p,
  limit,
  sort,
  order,
  role,
  status,
  approval,
  minOrder,
  maxOrder,
  minSpent,
  maxSpent,
}: {
  q: string;
  p: number;
  limit: number;
  sort: string;
  order: string;
  role: string[];
  status: string;
  approval: boolean;
  minOrder: string;
  maxOrder: string;
  minSpent: string;
  maxSpent: string;
}) => {
  const query = useApiQuery<Response>({
    key: [
      "customers-list",
      {
        q,
        p,
        limit,
        sort,
        order,
        role,
        status,
        approval,
        minOrder,
        maxOrder,
        minSpent,
        maxSpent,
      },
    ],
    endpoint: "/admin/customers",
    searchParams: {
      q,
      p,
      limit,
      sort,
      order,
      role,
      status,
      approval,
      minOrder,
      maxOrder,
      minSpent,
      maxSpent,
    },
  });
  return query;
};
