import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Body = FormData;

type Params = {
  productId: string;
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/products/:productId",
    method: "put",
    onSuccess: ({ data }) => {
      console.log(data.data.id);
      toast.success("Product successfully updated");
      invalidateQuery(queryClient, [
        ["products-list"],
        ["show-product", data.data.id],
      ]);
      router.push("/products");
    },
    onError: {
      message: "Product failed to update",
      title: "UPDATE_PRODUCT",
    },
  });

  return mutation;
};
