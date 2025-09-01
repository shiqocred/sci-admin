import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  name: string;
  email: string;
  phone: string;
};

type Params = {
  id: string;
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/settings/accounts/:id",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["accounts"],
        ["account", data.data.id],
      ]);
    },
    onError: {
      title: "UPDATE_ACCOUNT",
    },
  });

  return mutation;
};
