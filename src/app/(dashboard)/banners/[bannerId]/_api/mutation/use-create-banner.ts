import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = FormData;

export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/admin/banners",
    method: "post",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["banners-list"]]);
    },
    onError: {
      title: "CREATE_BANNERS",
    },
  });

  return mutation;
};
