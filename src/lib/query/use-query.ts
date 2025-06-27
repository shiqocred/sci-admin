import axios, { AxiosError } from "axios";
import { getCookie } from "cookies-next/client";
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";

import { buildUrl } from "./utils";
import { QueryParams, QuerySearchParams } from "./types";

type UseApiQueryOptions<T> = Omit<
  UseQueryOptions<T, AxiosError, T, QueryKey>,
  "queryKey" | "queryFn"
>;

interface UseApiQueryProps<T> extends UseApiQueryOptions<T> {
  key: QueryKey;
  endpoint: string;
  params?: QueryParams;
  searchParams?: QuerySearchParams;
}

export function useApiQuery<T = any>({
  key,
  endpoint,
  params,
  searchParams,
  ...options
}: UseApiQueryProps<T>) {
  const token = getCookie("accessToken");
  const urlWithParams = buildUrl(endpoint, searchParams);

  return useQuery<T, AxiosError>({
    queryKey: key,
    queryFn: async () => {
      const res = await axios.get(urlWithParams, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      return res.data as T;
    },
    ...options,
  });
}
