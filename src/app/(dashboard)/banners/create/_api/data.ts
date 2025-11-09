import { UseMutateConfig } from "@/lib/query/types";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invalidateQuery } from "@/lib/query";
import { CreateBannerBody } from "./types";

export const dataMutate = (
  queryClient: QueryClient,
  router: any
): {
  create: UseMutateConfig<CreateBannerBody>;
} => {
  return {
    create: {
      endpoint: "/admin/banners",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        await invalidateQuery(queryClient, [["banners-list"]]);
        router.push("/banners");
      },
      onError: {
        title: "CREATE_BANNERS",
      },
    },
  };
};
