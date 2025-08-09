import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    lat: string;
    long: string;
    address: string;
  } | null;
};

export const useGetLocation = () => {
  const query = useApiQuery<Response>({
    key: ["store-location"],
    endpoint: "/admin/settings/shipping/location",
  });
  return query;
};
