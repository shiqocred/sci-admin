import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Params = {
  position: string;
};

export const useDeleteTrending = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<undefined, Params>({
    endpoint: "/admin/product-trendings/:position",
    method: "delete",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["product-trendings-list"]]);
    },
    onError: {
      title: "DELETE_PRODUCT_TRENDING",
    },
  });

  return mutation;
};
