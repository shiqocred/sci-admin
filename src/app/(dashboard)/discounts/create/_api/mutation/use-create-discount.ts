import { invalidateQuery, useMutate } from "@/lib/query";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Body = {
  code: string;
  valueType: string;
  value: string;
  applyType: string;
  apply: string[] | null;
  eligibilityType: string | null;
  eligibility: string[] | null;
  minimumType: string;
  minimum: string | null;
  limitUse: string | null;
  limitOnce: CheckedState;
  startDiscount: string | null;
  endDiscount: string | null | undefined;
};

export const useCreateDiscount = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutate<Body>({
    endpoint: "/admin/discounts",
    method: "post",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      router.push("/discounts");
      await invalidateQuery(queryClient, [["discounts-list"]]);
    },
    onError: {
      title: "CREATE_DISCOUNT",
    },
  });

  return mutation;
};
