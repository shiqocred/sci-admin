import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    id: string;
    name: string;
    value: string;
    status: boolean;
  }[];
};

export const useGetCouriers = () => {
  const query = useApiQuery<Response>({
    key: ["couriers"],
    endpoint: "/admin/settings/shipping/couriers",
  });
  return query;
};
