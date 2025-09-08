import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = { expired: string };

export const useUpdateExpired = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/admin/settings/shipping/expired",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["payment-expired"]]);
    },
    onError: {
      title: "UPDATE_PAYMENT_EXPIRED",
    },
  });

  return mutation;
};
