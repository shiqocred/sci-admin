import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = FormData;

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/admin/suppliers",
    method: "post",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["suppliers-list"],
        ["suppliers-select"],
      ]);
    },
    onError: {
      title: "CREATE_SUPPLIER",
    },
  });

  return mutation;
};
