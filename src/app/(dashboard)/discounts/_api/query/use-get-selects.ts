import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    categories: {
      name: string;
      id: string;
    }[];
    suppliers: {
      name: string;
      id: string;
    }[];
    pets: {
      name: string;
      id: string;
    }[];
  };
};

export const useGetSelects = () => {
  const query = useApiQuery<Response>({
    key: ["selects"],
    endpoint: "/admin/selects",
  });
  return query;
};
