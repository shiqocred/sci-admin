import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  productId: string;
  position: string;
};

export const useCreateTrending = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/admin/product-trendings",
    method: "post",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["product-trendings-list"]]);
    },
    onError: {
      title: "CREATE_PRODUCT_TRENDING",
    },
  });

  return mutation;
};
