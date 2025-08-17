import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Params = {
  id: string;
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<undefined, Params>({
    endpoint: "/admin/suppliers/:id",
    method: "delete",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["suppliers-list"],
        ["suppliers-select"],
      ]);
    },
    onError: {
      title: "DELETE_SUPPLIER",
    },
  });

  return mutation;
};
