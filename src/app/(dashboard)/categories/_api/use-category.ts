import { useMutate } from "@/lib/query";
import { useApiQuery } from "@/lib/query/use-query";
import { useQueryClient } from "@tanstack/react-query";

import { dataMutate, dataQuery } from "./data";
import { GetCategoriesProps, GetCategoryShowProps } from "./types";

export const useGetCategories = ({
  q,
  p,
  limit,
  sort,
  order,
}: GetCategoriesProps) =>
  useApiQuery(dataQuery({ q, p, limit, sort, order }).list);

export const useGetCategory = ({ categoryId, open }: GetCategoryShowProps) =>
  useApiQuery(dataQuery(undefined, { categoryId, open }).show);

export const useDeleteCategory = () =>
  useMutate(dataMutate(useQueryClient()).delete);

export const useCreateCategory = () =>
  useMutate(dataMutate(useQueryClient()).create);

export const useUpdateCategory = () =>
  useMutate(dataMutate(useQueryClient()).update);
