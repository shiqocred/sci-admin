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
    name: string;
    startFreeShipping: Date;
    endFreeShipping: Date | null;
    status: "active" | "expired" | "scheduled";
  };
};

export const useGetFreeShipping = ({
  freeShippingId,
}: {
  freeShippingId: string;
}) => {
  const query = useApiQuery<Response>({
    key: ["free-shipping", freeShippingId],
    endpoint: `/admin/free-shippings/${freeShippingId}`,
    enabled: !!freeShippingId,
  });
  return query;
};
