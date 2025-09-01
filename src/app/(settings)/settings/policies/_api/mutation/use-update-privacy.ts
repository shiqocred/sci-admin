import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = { value: string };

export const useUpdatePrivacy = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/admin/settings/policies/privacy",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["policies"]]);
    },
    onError: {
      title: "UPDATE_PRIVACY_POLICY",
    },
  });

  return mutation;
};
