import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = FormData;

type Params = {
  id: string;
};

export const useUpdatePet = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/pets/:id",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["pets-list"],
        ["pets-select"],
        ["pet-show", { ...data.id }],
      ]);
      console.log(data.id);
    },
    onError: {
      title: "UPDATE_PET",
    },
  });

  return mutation;
};
