import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = { status: boolean };

type Params = {
  reviewId: string;
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/reviews/:reviewId",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["reviews-list"],
        ["review", data.data.id],
      ]);
    },
    onError: {
      title: "UPDATE_REVIEW",
    },
  });

  return mutation;
};
