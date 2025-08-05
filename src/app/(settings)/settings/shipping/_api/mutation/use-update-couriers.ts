import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  id: string;
  status: boolean;
}[];

export const useUpdateCouriers = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/admin/settings/shipping/couriers",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["couriers"]]);
    },
    onError: {
      title: "UPDATE_COURIERS",
    },
  });

  return mutation;
};
