import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
};

export const useGetAccount = ({
  adminId,
  edit,
}: {
  adminId: string;
  edit: boolean;
}) => {
  const query = useApiQuery<Response>({
    key: ["account", adminId],
    endpoint: `/admin/settings/accounts/${adminId}`,
    enabled: !!adminId && edit,
  });
  return query;
};
