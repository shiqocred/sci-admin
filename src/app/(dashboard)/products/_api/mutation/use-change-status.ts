import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Params = {
  id: string;
};

export const useChangeStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<undefined, Params>({
    endpoint: "/admin/products/:id/status",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["products-list"],
        ["products-show", { ...data.id }],
      ]);
    },
    onError: {
      title: "CHANGE_STATUS_PRODUCT",
    },
  });

  return mutation;
};
