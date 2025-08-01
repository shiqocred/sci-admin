// src/lib/api/types.ts
import { AxiosError, AxiosResponse } from "axios";

export type IfDefined<T, Then> = [T] extends [undefined] ? {} : Then;

export type MutationVariables<
  TBody = undefined,
  TParams = undefined,
  TSearchParams = undefined,
> = IfDefined<TBody, { body: TBody }> &
  IfDefined<TParams, { params: TParams }> &
  IfDefined<TSearchParams, { searchParams: TSearchParams }>;

export type UseMutateConfig<
  TBody = undefined,
  TParams = undefined,
  TSearchParams = undefined,
> = {
  endpoint: string;
  method: "post" | "put" | "delete" | "patch" | "get";
  onSuccess?: (
    data: AxiosResponse<any>,
    variables: MutationVariables<TBody, TParams, TSearchParams>,
    context: unknown
  ) => unknown | Promise<unknown>;
  onError: {
    /**
     * title for error logging like "ADD_USER" it will be "ERROR_ADD_USER"
     */
    title: string;
  };
};

export type ErrorResposeType = {
  /**
   * Axios error object.
   */
  err: AxiosError;
  /**
   * title for error logging like "ADD_USER" it will be "ERROR_ADD_USER"
   */
  title: string;
};

export type QueryParams = Record<string, string | number>;
export type QuerySearchParams = Record<
  string,
  string | number | boolean | undefined
>;
