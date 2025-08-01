import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Body = FormData;

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutate<Body>({
    endpoint: "/admin/products",
    method: "post",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["products-list"]]);
      router.push("/products");
    },
    onError: {
      title: "CREATE_PRODUCT",
    },
  });

  return mutation;
};
