import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = FormData;

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/admin/suppliers",
    method: "post",
    onSuccess: () => {
      toast.success("Supplier successfully created");
      invalidateQuery(queryClient, [["suppliers-list"]]);
    },
    onError: {
      message: "Supplier failed to create",
      title: "CREATE_SUPPLIER",
    },
  });

  return mutation;
};
