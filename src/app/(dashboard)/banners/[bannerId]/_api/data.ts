import { UseApiQueryProps } from "@/lib/query/use-query";
import { UseMutateConfig } from "@/lib/query/types";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invalidateQuery } from "@/lib/query";
import {
  ShowBannerResponse,
  UpdateBannerBody,
  UpdateBannerParams,
} from "./types";

const key = "banner-detail";

export const dataQuery = (
  id?: string
): {
  show: UseApiQueryProps<ShowBannerResponse>;
} => {
  return {
    show: {
      key: [key, id],
      endpoint: `/admin/banners/${id}`,
      enabled: !!id,
    },
  };
};

export const dataMutate = (
  queryClient: QueryClient,
  router: any
): {
  update: UseMutateConfig<UpdateBannerBody, UpdateBannerParams>;
} => {
  return {
    update: {
      endpoint: "/admin/banners/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        await invalidateQuery(queryClient, [
          ["banners-list"],
          [key, data.data.id],
        ]);
        router.push("/banners");
      },
      onError: {
        title: "UPDATE_BANNER",
      },
    },
  };
};
