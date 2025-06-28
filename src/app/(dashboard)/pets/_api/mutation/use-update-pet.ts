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

export const useUpdatePet = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/pets/:id",
    method: "put",
    onSuccess: ({ data }) => {
      toast.success("Pet successfully updated");
      invalidateQuery(queryClient, [
        ["pets-list"],
        ["pet-show", { ...data.id }],
      ]);
      console.log(data.id);
    },
    onError: {
      message: "Pet failed to update",
      title: "UPDATE_PET",
    },
  });

  return mutation;
};
