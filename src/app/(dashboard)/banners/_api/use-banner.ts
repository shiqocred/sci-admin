import { useMutate } from "@/lib/query";
import { useApiQuery } from "@/lib/query/use-query";
import { useQueryClient } from "@tanstack/react-query";

import { GetBannerProps } from "./types";
import { dataMutate, dataQuery } from "./data";

export const useGetSelects = () => useApiQuery(dataQuery().select);

export const useGetBanners = ({ q, p, limit, sort, order }: GetBannerProps) =>
  useApiQuery(dataQuery({ q, p, limit, sort, order }).getBanner);

export const useDeleteBanner = () =>
  useMutate(dataMutate(useQueryClient()).delete);

export const useUpdateBannerStatus = () =>
  useMutate(dataMutate(useQueryClient()).updateStatus);
