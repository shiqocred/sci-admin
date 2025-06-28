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
    onSuccess: () => {
      toast.success("Supplier successfully deleted");
      invalidateQuery(queryClient, [["suppliers-list"]]);
    },
    onError: {
      message: "Supplier failed to delete",
      title: "DELETE_SUPPLIER",
    },
  });

  return mutation;
};
