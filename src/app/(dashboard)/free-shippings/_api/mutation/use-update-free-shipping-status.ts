import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  status: boolean;
};

type Params = {
  id: string;
};

export const useUpdateFreeShippingStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/free-shippings/:id/status",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["free-shippings-list"],
        ["free-shipping", data.data.id],
      ]);
    },
    onError: {
      title: "UPDATE_FREE_SHIPPING_STATUS",
    },
  });

  return mutation;
};
