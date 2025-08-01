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
  startDiscount: Date | null;
  endDiscount: Date | null | undefined;
};

type Params = {
  id: string;
};

export const useUpdateDiscount = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutate<Body, Params>({
    endpoint: "/admin/discounts/:id",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["discounts-list"],
        ["discount", data.data.id],
      ]);
      router.push("/discounts");
    },
    onError: {
      title: "UPDATE_DISCOUNT",
    },
  });

  return mutation;
};
