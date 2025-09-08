import { useApiQuery } from "@/lib/query/use-query";

type Response = { data: string | null };

export const useGetExpired = () => {
  const query = useApiQuery<Response>({
    key: ["payment-expired"],
    endpoint: "/admin/settings/shipping/expired",
  });
  return query;
};
