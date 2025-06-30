import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  name: string;
  slug: string;
};

type Params = {
  id: string;
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/categories/:id",
    method: "put",
    onSuccess: ({ data }) => {
      toast.success("Category successfully updated");
      invalidateQuery(queryClient, [
        ["categories-list"],
        ["categories-select"],
        ["category-show", { ...data.id }],
      ]);
      console.log(data.id);
    },
    onError: {
      message: "Category failed to update",
      title: "UPDATE_CATEGORY",
    },
  });

  return mutation;
};
