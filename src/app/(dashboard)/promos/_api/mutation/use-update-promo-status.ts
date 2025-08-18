import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  status: boolean;
};

type Params = {
  id: string;
};

export const useUpdatePromoStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/promos/:id/status",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["promos-list"],
        ["promo-detail", data.data.id],
      ]);
    },
    onError: {
      title: "UPDATE_PROMO_STATUS",
    },
  });

  return mutation;
};
