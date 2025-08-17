import { useApiQuery } from "@/lib/query/use-query";

export type SelectValueProps = {
  name: string;
  id: string;
};

type Response = {
  data: {
    categories: SelectValueProps[];
    suppliers: SelectValueProps[];
    pets: SelectValueProps[];
  };
};

export const useGetSelects = () => {
  const query = useApiQuery<Response>({
    key: ["selects"],
    endpoint: "/admin/selects",
  });
  return query;
};
