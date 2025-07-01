import { PaginationMeta } from "@/lib/pagination/fastPaginate";
import { useApiQuery } from "@/lib/query/use-query";

type ProductListItem = {
  image: string | null;
  id: string;
  name: string;
  slug: string;
  status: boolean | null;
  categoryName: string | null;
  supplierName: string | null;
  stock: number;
  variantCount: number;
  petCount: number;
};

type OptionItem = {
  id: string;
  name: string;
};

type Response = {
  data: {
    data: ProductListItem[];
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
