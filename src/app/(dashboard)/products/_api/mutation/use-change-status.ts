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
    onSuccess: ({ data }) => {
      toast.success(data.message ?? "Product successfully changed status");
      invalidateQuery(queryClient, [
        ["products-list"],
        ["products-show", { ...data.id }],
      ]);
    },
    onError: {
      message: "Product failed to change status",
      title: "CHANGE_STATUS_PRODUCT",
    },
  });

  return mutation;
};
