import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = FormData;

type Params = {
  id: string;
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/categories/:id",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["categories-list"],
        ["categories-select"],
        ["category-show", { ...data.id }],
      ]);
      console.log(data.id);
    },
    onError: {
      title: "UPDATE_CATEGORY",
    },
  });

  return mutation;
};
