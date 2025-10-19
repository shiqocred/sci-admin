import { useMutate } from "@/lib/query";
import { toast } from "sonner";

type Params = {
  customerId: string;
};

export const useDownloadExport = () => {
  const mutation = useMutate<undefined, Params>({
    endpoint: "/admin/customers/:customerId/export",
    method: "post",
    onSuccess: async () => {
      toast.success("Detail Customer Data Downloaded");
    },
    onError: {
      title: "DOWNLOAD_DETAIL_CUSTOMER_DATA",
    },
    axiosConfig: {
      responseType: "blob",
    },
  });

  return mutation;
};
