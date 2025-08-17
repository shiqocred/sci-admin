import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Body = FormData;

export const useCreateBanner = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutate<Body>({
    endpoint: "/admin/banners",
    method: "post",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["banners-list"]]);
      router.push("/banners");
    },
    onError: {
      title: "CREATE_BANNERS",
    },
  });

  return mutation;
};
