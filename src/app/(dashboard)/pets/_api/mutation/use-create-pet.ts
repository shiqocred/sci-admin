import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = FormData;

export const useCreatePet = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/admin/pets",
    method: "post",
    onSuccess: () => {
      toast.success("Pet successfully created");
      invalidateQuery(queryClient, [["pets-list"], ["pets-select"]]);
    },
    onError: {
      message: "Pet failed to create",
      title: "CREATE_Pet",
    },
  });

  return mutation;
};
