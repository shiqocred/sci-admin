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
    onSuccess: ({ data }) => {
      toast.success("Supplier successfully updated");
      invalidateQuery(queryClient, [
        ["suppliers-list"],
        ["supplier-show", { ...data.id }],
      ]);
      console.log(data.id);
    },
    onError: {
      message: "Supplier failed to update",
      title: "UPDATE_SUPPLIER",
    },
  });

  return mutation;
};
