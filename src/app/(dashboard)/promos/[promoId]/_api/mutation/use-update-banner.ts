import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Body = FormData;

type Params = {
  id: string;
};

export const useUpdatePromo = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/promos/:id",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["promos-list"],
        ["promo-detail", data.data.id],
      ]);
      router.push("/promos");
    },
    onError: {
      title: "UPDATE_PROMO",
    },
  });

  return mutation;
};
