import { useApiQuery } from "@/lib/query/use-query";

export type PromoProps = {
  name: string;
  imageOld: string;
  selected: string[];
  startAt: string;
  endAt?: string;
  isEnd: boolean;
  status: string;
};

type Response = {
  data: PromoProps;
};

export const useGetPromo = ({ id }: { id: string }) => {
  const query = useApiQuery<Response>({
    key: ["promo-detail", id],
    endpoint: `/admin/promos/${id}`,
    enabled: !!id,
  });
  return query;
};
