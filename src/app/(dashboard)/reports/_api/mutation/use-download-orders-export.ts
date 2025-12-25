import { useMutate } from "@/lib/query";
import { toast } from "sonner";

export const useDownloadOrdersExport = () => {
  const mutation = useMutate({
    endpoint: "/admin/erp/orders",
    method: "post",
    onSuccess: async () => {
      toast.success("ERP Orders Data Downloaded");
    },
    onError: {
      title: "DOWNLOAD_ERP_ORDERS_DATA",
    },
    axiosConfig: {
      responseType: "blob",
    },
  });

  return mutation;
};
