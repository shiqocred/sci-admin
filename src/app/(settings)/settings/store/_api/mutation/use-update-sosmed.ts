import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = { facebook: string; linkedin: string; instagram: string };

export const useUpdateSosmed = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/admin/settings/store/sosmed",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["store"]]);
    },
    onError: {
      title: "UPDATE_SOSMED",
    },
  });

  return mutation;
};
