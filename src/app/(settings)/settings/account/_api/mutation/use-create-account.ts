import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/admin/settings/accounts",
    method: "post",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["accounts"]]);
    },
    onError: {
      title: "CREATE_ACCOUNT",
    },
  });

  return mutation;
};
