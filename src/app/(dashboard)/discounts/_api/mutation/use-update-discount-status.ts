import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  status: boolean;
};

type Params = {
  id: string;
};

export const useUpdateDiscountStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/discounts/:id/status",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["discounts-list"],
        ["discount", data.data.id],
      ]);
    },
    onError: {
      title: "UPDATE_DISCOUNT_STATUS",
    },
  });

  return mutation;
};
