import { PaginationMeta } from "@/lib/pagination";
import { GetListProps } from "@/lib/utils";

// query
export type CategoriesProps = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
};

export type CategoriesListProps = CategoriesProps & {
  totalProducts: number;
};

export type CategoriesShowResponse = {
  data: CategoriesProps;
};

export type CategoriesListResponse = {
  data: {
    data: CategoriesListProps[];
    pagination: PaginationMeta;
  };
};

export type GetCategoriesProps = GetListProps;

export type GetCategoryShowProps = { categoryId: string; open: boolean };

// mutate
export type CategoriesParams = { id: string };

export type CategoriesBody = FormData;
