import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Params = {
  id: string;
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<undefined, Params>({
    endpoint: "/admin/products/:id",
    method: "delete",
    onSuccess: () => {
      toast.success("Product successfully deleted");
      invalidateQuery(queryClient, [["products-list"]]);
    },
    onError: {
      message: "Product failed to delete",
      title: "DELETE_PRODUCT",
    },
  });

  return mutation;
};
