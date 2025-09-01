import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  answer: string;
  question: string;
};

type Params = {
  id: string;
};

export const useUpdateFaq = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/settings/faqs/:id",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["faqs"], ["faq", data.data.id]]);
    },
    onError: {
      title: "UPDATE_FAQ",
    },
  });

  return mutation;
};
