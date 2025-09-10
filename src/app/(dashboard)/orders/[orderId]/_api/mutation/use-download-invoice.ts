import { useMutate } from "@/lib/query";
import { toast } from "sonner";

type Params = {
  id: string;
};

export const useDownloadInvoice = () => {
  const mutation = useMutate<undefined, Params>({
    endpoint: "/admin/orders/:id/invoice",
    method: "post",
    onSuccess: async () => {
      toast.success("Order Invoice Downloaded");
    },
    onError: {
      title: "DOWNLOAD_INVOICE",
    },
    axiosConfig: {
      responseType: "blob",
    },
  });

  return mutation;
};
