import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  answer: string;
  question: string;
};

export const useCreateFaq = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/admin/settings/faqs",
    method: "post",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["faqs"]]);
    },
    onError: {
      title: "CREATE_FAQ",
    },
  });

  return mutation;
};
