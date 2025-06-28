import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Params = {
  id: string;
};

export const useDeletePet = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<undefined, Params>({
    endpoint: "/admin/pets/:id",
    method: "delete",
    onSuccess: () => {
      toast.success("Pet successfully deleted");
      invalidateQuery(queryClient, [["pets-list"]]);
    },
    onError: {
      message: "Pet failed to delete",
      title: "DELETE_PET",
    },
  });

  return mutation;
};
