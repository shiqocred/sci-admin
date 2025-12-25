import { useMutate } from "@/lib/query";
import { toast } from "sonner";

export const useDownloadCustomersExport = () => {
  const mutation = useMutate({
    endpoint: "/admin/erp/customers",
    method: "post",
    onSuccess: async () => {
      toast.success("ERP Customers Data Downloaded");
    },
    onError: {
      title: "DOWNLOAD_ERP_CUSTOMERS_DATA",
    },
    axiosConfig: {
      responseType: "blob",
    },
  });

  return mutation;
};
