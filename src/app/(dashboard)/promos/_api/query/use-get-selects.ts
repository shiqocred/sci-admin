import { useApiQuery } from "@/lib/query/use-query";

export type SelectPromoProps = {
  image: string | null;
  id: string;
  name: string;
  status: boolean | null;
};

type Response = {
  data: SelectPromoProps[];
};

export const useGetSelects = () => {
  const query = useApiQuery<Response>({
    key: ["select-promos"],
    endpoint: "/admin/selects/promos",
  });
  return query;
};
