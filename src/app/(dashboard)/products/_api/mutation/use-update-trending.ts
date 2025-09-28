import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Params = {
  position: string;
};

type Body = {
  productId: string;
};

export const useUpdateTrending = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/product-trendings/:position",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["product-trendings-list"]]);
    },
    onError: {
      title: "UPDATE_PRODUCT_TRENDING",
    },
  });

  return mutation;
};
