import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";

import { buildUrl } from "./utils";
import { QueryParams } from "./types";

type UseApiQueryOptions<T> = Omit<
  UseQueryOptions<T, AxiosError, T, QueryKey>,
  "queryKey" | "queryFn"
>;

export interface UseApiQueryProps<T> extends UseApiQueryOptions<T> {
  key: QueryKey;
  endpoint: string;
  params?: QueryParams;
  searchParams?: Record<
    string,
    string | number | boolean | (string | number | boolean)[] | undefined
  >;
  axiosConfig?: AxiosRequestConfig<any>;
}

export function useApiQuery<T = any>({
  key,
  endpoint,
  params,
  searchParams,
  axiosConfig,
  ...options
}: UseApiQueryProps<T>) {
  const urlWithParams = buildUrl(endpoint, searchParams);

  return useQuery<T, AxiosError>({
    queryKey: key,
    queryFn: async () => {
      const res = await axios.get(urlWithParams, {
        params,
        ...axiosConfig,
      });
      return res.data as T;
    },
    ...options,
  });
}
