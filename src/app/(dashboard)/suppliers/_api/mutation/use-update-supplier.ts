import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = FormData;

type Params = {
  id: string;
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/suppliers/:id",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["suppliers-list"],
        ["suppliers-select"],
        ["supplier-show", { ...data.id }],
      ]);
    },
    onError: {
      title: "UPDATE_SUPPLIER",
    },
  });

  return mutation;
};
