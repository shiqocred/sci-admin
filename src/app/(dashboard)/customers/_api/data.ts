import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CustomersListResponse,
  GetCustomerReviewProps,
  GetCustomersParamsProps,
  GetCustomerIdParamsProps,
  UpdateReviewBody,
} from "./types";

const key = ["customers-list", "customers-review", "customers-detail"];

export const dataQuery = (
  customersParamsProps?: GetCustomersParamsProps,
  reviewParamsProps?: GetCustomerIdParamsProps
): {
  list: UseApiQueryProps<CustomersListResponse>;
  review: UseApiQueryProps<GetCustomerReviewProps>;
} => {
  return {
    list: {
      key: [key[0], customersParamsProps],
      endpoint: "/admin/customers",
      searchParams: customersParamsProps,
    },
    review: {
      key: [key[1], { id: reviewParamsProps?.id }],
      endpoint: `/admin/customers/${reviewParamsProps?.id}/review`,
      enabled: !!reviewParamsProps?.id,
    },
  };
};

export const dataMutate = (
  queryClient: QueryClient
): {
  delete: UseMutateConfig<undefined, GetCustomerIdParamsProps>;
  review: UseMutateConfig<UpdateReviewBody, GetCustomerIdParamsProps>;
  verifyEmail: UseMutateConfig<undefined, GetCustomerIdParamsProps>;
} => {
  return {
    delete: {
      endpoint: "/admin/customers/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        await invalidateQuery(queryClient, [[key[0]], [key[1]]]);
      },
      onError: {
        title: "DELETE_USER",
      },
    },
    review: {
      endpoint: "/admin/customers/:id/review",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        await invalidateQuery(queryClient, [
          [key[0]],
          [key[1]],
          [key[2], data.data.userId],
        ]);
      },
      onError: {
        title: "APPROVE_UPGRADE_ROLE",
      },
    },
    verifyEmail: {
      endpoint: "/admin/customers/:id/verify",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        await invalidateQuery(queryClient, [
          [key[0]],
          [key[1]],
          [key[2], data.data.userId],
        ]);
      },
      onError: {
        title: "VERIFY_EMAIL",
      },
    },
  };
};
