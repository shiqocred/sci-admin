import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BannerParams,
  BannerResponse,
  BannerUpdateBody,
  GetBannerProps,
  SelectResponse,
} from "./types";

const key = "banners-list";

export const dataQuery = (
  bannerProps?: GetBannerProps
): {
  select: UseApiQueryProps<SelectResponse>;
  getBanner: UseApiQueryProps<BannerResponse>;
} => {
  return {
    select: {
      key: ["select-banners"],
      endpoint: "/admin/selects/banners",
    },
    getBanner: {
      key: [key, bannerProps],
      endpoint: "/admin/banners",
      searchParams: bannerProps,
    },
  };
};

export const dataMutate = (
  queryClient: QueryClient
): {
  delete: UseMutateConfig<undefined, BannerParams>;
  updateStatus: UseMutateConfig<BannerUpdateBody, BannerParams>;
} => {
  return {
    delete: {
      endpoint: "/admin/banners/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        await invalidateQuery(queryClient, [[key]]);
      },
      onError: {
        title: "DELETE_BANNER",
      },
    },
    updateStatus: {
      endpoint: "/admin/banners/:id/status",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        await invalidateQuery(queryClient, [
          [key],
          ["banner-detail", data.data.id],
        ]);
      },
      onError: {
        title: "UPDATE_BANNER_STATUS",
      },
    },
  };
};
