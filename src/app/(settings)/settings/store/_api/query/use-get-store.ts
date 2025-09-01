import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    store: {
      name: string;
      address: string;
      phone: string | null;
      whatsapp: string | null;
    };
    sosmed: {
      facebook: string | null;
      linkedin: string | null;
      instagram: string | null;
    };
  };
};

export const useGetStore = () => {
  const query = useApiQuery<Response>({
    key: ["store"],
    endpoint: "/admin/settings/store",
  });
  return query;
};
