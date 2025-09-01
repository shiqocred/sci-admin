import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Params = {
  id: string;
};

export const useDeleteFaq = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<undefined, Params>({
    endpoint: "/admin/settings/faqs/:id",
    method: "delete",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["faqs"]]);
    },
    onError: {
      title: "DELETE_FAQ",
    },
  });

  return mutation;
};
