import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

import { isRecord } from "./utils";

import { errorResponse } from "./error-response";
import { UseMutateConfig, MutationVariables } from "./types";
import { apiUrl } from "@/config";

export const useMutate = <
  TBody = undefined,
  TParams = undefined,
  TSearchParams = undefined,
>({
  endpoint,
  method,
  onSuccess,
  onError,
  axiosConfig,
}: UseMutateConfig<TBody, TParams, TSearchParams>) =>
  useMutation<
    AxiosResponse,
    AxiosError,
    MutationVariables<TBody, TParams, TSearchParams>
  >({
    mutationFn: async (variables) => {
      let url = apiUrl + endpoint;

      if (
        variables &&
        "params" in variables &&
        variables.params !== undefined &&
        isRecord(variables.params)
      ) {
        for (const [key, val] of Object.entries(variables.params)) {
          url = url.replace(`:${key}`, encodeURIComponent(val));
        }
      }

      if (
        variables &&
        "searchParams" in variables &&
        variables.searchParams !== undefined
      ) {
        const query = new URLSearchParams(
          variables.searchParams as any
        ).toString();
        url += url.includes("?") ? `&${query}` : `?${query}`;
      }

      const body =
        variables && "body" in variables && variables.body !== undefined
          ? variables.body
          : {};

      switch (method) {
        case "get":
          return axios.get(url, axiosConfig);
        case "post":
          return axios.post(url, body, axiosConfig);
        case "put":
          return axios.put(url, body, axiosConfig);
        case "delete":
          return axios.delete(url, axiosConfig);
        default:
          return axios.patch(url, body, axiosConfig);
      }
    },
    onSuccess,
    onError: (err) =>
      errorResponse({
        err,
        title: onError.title,
      }),
  });
