import { useMutate } from "@/lib/query";
import { toast } from "sonner";

type Body = {
  statuses: string[];
  customers: string[];
  roles: string[];
  products: string[];
  periodStart: string | null;
  periodEnd: string | null;
  isAllPeriod: boolean;
  type: string;
};

export const useDownloadExport = () => {
  const mutation = useMutate<Body>({
    endpoint: "/admin/orders/export",
    method: "post",
    onSuccess: async () => {
      toast.success("Order Data Downloaded");
    },
    onError: {
      title: "DOWNLOAD_ORDER_DATA",
    },
    axiosConfig: {
      responseType: "blob",
    },
  });

  return mutation;
};
