import { useMutate } from "@/lib/query";
import { useApiQuery } from "@/lib/query/use-query";
import { useQueryClient } from "@tanstack/react-query";

import { dataMutate, dataQuery } from "./data";
import { GetCustomerIdParamsProps, GetCustomersParamsProps } from "./types";

export const useGetCustomers = ({
  q,
  p,
  limit,
  sort,
  order,
  role,
  status,
  approval,
  minOrder,
  maxOrder,
  minSpent,
  maxSpent,
}: GetCustomersParamsProps) =>
  useApiQuery(
    dataQuery({
      q,
      p,
      limit,
      sort,
      order,
      role,
      status,
      approval,
      minOrder,
      maxOrder,
      minSpent,
      maxSpent,
    }).list
  );

export const useGetCustomersReview = ({ id }: GetCustomerIdParamsProps) =>
  useApiQuery(dataQuery(undefined, { id }).review);

export const useDeleteCustomer = () =>
  useMutate(dataMutate(useQueryClient()).delete);

export const useReviewCustomer = () =>
  useMutate(dataMutate(useQueryClient()).review);

export const useVerifyEmailCustomer = () =>
  useMutate(dataMutate(useQueryClient()).verifyEmail);
