import { invalidateQuery, useMutate } from "@/lib/query";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Body = {
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

export const useCreateFreeShipping = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutate<Body>({
    endpoint: "/admin/free-shippings",
    method: "post",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      router.push("/free-shippings");
      await invalidateQuery(queryClient, [["free-shippings-list"]]);
    },
    onError: {
      title: "CREATE_FREE_SHIPPINGS",
    },
  });

  return mutation;
};
