import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Params = {
  id: string;
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<undefined, Params>({
    endpoint: "/admin/categories/:id",
    method: "delete",
    onSuccess: () => {
      toast.success("Category successfully deleted");
      invalidateQuery(queryClient, [["categories-list"]]);
    },
    onError: {
      message: "Category failed to delete",
      title: "DELETE_CATEGORY",
    },
  });

  return mutation;
};
