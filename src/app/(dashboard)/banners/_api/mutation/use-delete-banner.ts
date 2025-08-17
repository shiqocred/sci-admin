import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Params = {
  id: string;
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<undefined, Params>({
    endpoint: "/admin/banners/:id",
    method: "delete",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["banners-list"]]);
    },
    onError: {
      title: "DELETE_BANNER",
    },
  });

  return mutation;
};
