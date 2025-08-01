import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    email: string;
    name: string;
    id: string;
  }[];
};

export const useGetSelectsUsers = () => {
  const query = useApiQuery<Response>({
    key: ["selects-users"],
    endpoint: "/admin/selects/users",
  });
  return query;
};
