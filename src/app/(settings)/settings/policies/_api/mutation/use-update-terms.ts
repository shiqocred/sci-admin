import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = { value: string };

export const useUpdateTerms = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/admin/settings/policies/terms",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["policies"]]);
    },
    onError: {
      title: "UPDATE_TERMS_OF_USE",
    },
  });

  return mutation;
};
