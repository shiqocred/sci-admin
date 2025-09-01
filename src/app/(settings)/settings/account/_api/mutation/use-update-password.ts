import { useMutate } from "@/lib/query";
import { toast } from "sonner";

type Body = {
  password: string;
};

type Params = {
  id: string;
};

export const useUpdatePassword = () => {
  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/settings/accounts/:id/password",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
    },
    onError: {
      title: "UPDATE_ACCOUNT_PASSWORD",
    },
  });

  return mutation;
};
