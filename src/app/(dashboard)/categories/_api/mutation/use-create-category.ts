import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  name: string;
  slug: string;
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/admin/categories",
    method: "post",
    onSuccess: () => {
      toast.success("Category successfully created");
      invalidateQuery(queryClient, [
        ["categories-list"],
        ["categories-select"],
      ]);
    },
    onError: {
      message: "Category failed to create",
      title: "CREATE_CATEGORY",
    },
  });

  return mutation;
};
