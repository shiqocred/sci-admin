import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  lat: string;
  long: string;
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/admin/settings/shipping/location",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["store-location"]]);
    },
    onError: {
      title: "UPDATE_STORE_LOCATION",
    },
  });

  return mutation;
};
