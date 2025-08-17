import { PaginationMeta } from "@/lib/pagination/fastPaginate";
import { useApiQuery } from "@/lib/query/use-query";

type OptionItem = {
  id: string;
  name: string;
};

type Variant = {
  sku: string;
  stock: string;
  name: string;
};

export type ProductGrouped = {
  id: string;
  name: string;
  slug: string;
  available: string[];
  status: boolean;
  image: string | null;
  variants: Variant[] | null;
  default_variant: Variant | null;
};

type Response = {
  data: {
    data: ProductGrouped[];
    selectOptions: {
      categories: OptionItem[];
      suppliers: OptionItem[];
      pets: OptionItem[];
    };
    pagination: PaginationMeta;
  };
};

type UseGetProductsParams = {
  q?: string;
  p?: number;
  limit?: number;
  sort?: string;
  order?: string;
  categoryId?: string[];
  supplierId?: string[];
  petId?: string[];
  status?: boolean;
};

export const useGetProducts = ({
  q,
  p,
  limit,
  sort,
  order,
  categoryId,
  supplierId,
  petId,
  status,
}: UseGetProductsParams) => {
  return useApiQuery<Response>({
    key: [
      "products-list",
      { q, p, limit, sort, order, categoryId, supplierId, petId, status },
    ],
    endpoint: "/admin/products",
    searchParams: {
      q,
      p,
      limit,
      sort,
      order,
      categoryId: categoryId?.length ? categoryId : undefined,
      supplierId: supplierId?.length ? supplierId : undefined,
      petId: petId?.length ? petId : undefined,
      status,
    },
  });
};
