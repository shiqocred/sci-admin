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
    products: {
      id: string;
      name: string;
    }[];
    promos: {
      id: string;
      name: string;
    }[];
  };
};

export const useGetSelects = () => {
  const query = useApiQuery<Response>({
    key: ["select-banners"],
    endpoint: "/admin/selects/banners",
  });
  return query;
};
