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
    onSuccess: ({ data }) => {
      toast.success(data.message ?? "User successfully approve upgrade role");
      invalidateQuery(queryClient, [["customers-list"], ["customers-review"]]);
    },
    onError: {
      message: "User failed to approved upgrade role",
      title: "APPROVE_UPGRADE_ROLE",
    },
  });

  return mutation;
};
