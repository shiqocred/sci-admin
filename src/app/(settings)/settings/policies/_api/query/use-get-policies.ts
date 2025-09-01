import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    privacy: string | null;
    return: string | null;
    termOfUse: string | null;
  };
};

export const useGetPolicies = () => {
  const query = useApiQuery<Response>({
    key: ["policies"],
    endpoint: "/admin/settings/policies",
  });
  return query;
};
