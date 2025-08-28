import { invalidateQuery, useMutate } from "@/lib/query";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Body = {
  name: string;
  applyType: string;
  apply: string[] | null;
  eligibilityType: string | null;
  eligibility: string[] | null;
  minimumType: string;
  minimum: string | null;
  limitUse: string | null;
  limitOnce: CheckedState;
  startFreeShipping: Date | null;
  endFreeShipping: Date | null | undefined;
};

type Params = {
  id: string;
};

export const useUpdateFreeShipping = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/free-shippings/:id",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["free-shippings-list"],
        ["free-shipping", data.data.id],
      ]);
      router.push("/free-shippings");
    },
    onError: {
      title: "UPDATE_FREE_SHIPPING",
    },
  });

  return mutation;
};
