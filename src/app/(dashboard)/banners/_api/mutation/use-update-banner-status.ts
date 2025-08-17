import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  status: boolean;
};

type Params = {
  id: string;
};

export const useUpdateBannerStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/banners/:id/status",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["banners-list"],
        ["banner-detail", data.data.id],
      ]);
    },
    onError: {
      title: "UPDATE_BANNER_STATUS",
    },
  });

  return mutation;
};
