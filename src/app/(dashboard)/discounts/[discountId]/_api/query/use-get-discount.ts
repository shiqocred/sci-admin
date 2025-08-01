import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    apply: string[];
    applyType: "products" | "categories" | "suppliers" | "pets";
    eligibility: string[];
    eligibilityType: "user" | "role" | null;
    limitOnce: boolean | null;
    limitUse: string | null;
    minimum: string | null;
    minimumType: "quantity" | "amount" | null;
    code: string;
    startDiscount: Date;
    endDiscount: Date | null;
    value: string;
    valueType: "fixed" | "percentage";
    status: "active" | "expired" | "scheduled";
  };
};

export const useGetDiscount = ({ discountId }: { discountId: string }) => {
  const query = useApiQuery<Response>({
    key: ["discount", discountId],
    endpoint: `/admin/discounts/${discountId}`,
    enabled: !!discountId,
  });
  return query;
};
