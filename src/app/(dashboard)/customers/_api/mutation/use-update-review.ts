import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  status: "approve" | "reject";
  message?: string;
};
type Params = {
  id: string;
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/customers/:id/review",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["customers-list"],
        ["customers-review"],
      ]);
    },
    onError: {
      title: "APPROVE_UPGRADE_ROLE",
    },
  });

  return mutation;
};
