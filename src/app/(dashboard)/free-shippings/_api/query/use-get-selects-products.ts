import { useApiQuery } from "@/lib/query/use-query";

type Pricing = {
  role: string;
  price: string;
};

type Variant = {
  id: string;
  name: string;
  stock: string;
  price: string;
  pricing: Pricing[];
};

export type ProductTransformed = {
  id: string;
  name: string;
  variants: Variant[] | null;
  defaultVariant: Variant | null;
};

type Response = {
  data: ProductTransformed[];
};

export const useGetSelectsProducts = () => {
  const query = useApiQuery<Response>({
    key: ["selects-products"],
    endpoint: "/admin/selects/products",
  });
  return query;
};
