import { useApiQuery } from "@/lib/query/use-query";

type Variants = {
  id: string;
  name: string;
  stock: number;
  normalPrice: number;
  basicPrice: number;
  petShopPrice: number;
  doctorPrice: number;
};

type Response = {
  data: {
    id: string;
    name: string;
    default_variant: Variants | null;
    variants: Variants[] | null;
  }[];
};

export const useGetSelectsProducts = () => {
  const query = useApiQuery<Response>({
    key: ["selects-products"],
    endpoint: "/admin/selects/products",
  });
  return query;
};
