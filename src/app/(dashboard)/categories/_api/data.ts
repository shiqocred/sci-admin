import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CategoriesListResponse,
  GetCategoryShowProps,
  GetCategoriesProps,
  CategoriesShowResponse,
  CategoriesBody,
  CategoriesParams,
} from "./types";

const key = ["categories-list", "category-show", "categories-select"];

export const dataQuery = (
  categoriesProps?: GetCategoriesProps,
  categoryShowProps?: GetCategoryShowProps
): {
  list: UseApiQueryProps<CategoriesListResponse>;
  show: UseApiQueryProps<CategoriesShowResponse>;
} => {
  return {
    list: {
      key: [key[0], categoriesProps],
      endpoint: "/admin/categories",
      searchParams: categoriesProps,
    },
    show: {
      key: [key[1], { categoryId: categoryShowProps?.categoryId }],
      endpoint: `/admin/categories/${categoryShowProps?.categoryId}`,
      enabled: !!categoryShowProps?.categoryId && categoryShowProps.open,
    },
  };
};

export const dataMutate = (
  queryClient: QueryClient
): {
  create: UseMutateConfig<CategoriesBody>;
  update: UseMutateConfig<CategoriesBody, CategoriesParams>;
  delete: UseMutateConfig<undefined, CategoriesParams>;
} => {
  return {
    create: {
      endpoint: "/admin/categories",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        await invalidateQuery(queryClient, [[key[0]], [key[2]]]);
      },
      onError: {
        title: "CREATE_CATEGORY",
      },
    },
    update: {
      endpoint: "/admin/categories/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        await invalidateQuery(queryClient, [
          [key[0]],
          [key[2]],
          [key[1], data.data.id],
        ]);
      },
      onError: {
        title: "UPDATE_CATEGORY",
      },
    },
    delete: {
      endpoint: "/admin/categories/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        await invalidateQuery(queryClient, [[key[0]], [key[2]]]);
      },
      onError: {
        title: "DELETE_CATEGORY",
      },
    },
  };
};
