import { useMutate } from "@/lib/query";
import { toast } from "sonner";

type Body = {
  suppliers: string[];
  products: string[];
  periodStart: string | null;
  periodEnd: string | null;
  isAllPeriod: boolean;
  isAllSupplier: boolean;
  isAllProduct: boolean;
  isSameDate: boolean;
  type: string;
};

export const useDownloadExport = () => {
  const mutation = useMutate<Body>({
    endpoint: "/admin/customers/export",
    method: "post",
    onSuccess: async () => {
      toast.success("Top Customers Data Downloaded");
    },
    onError: {
      title: "DOWNLOAD_TOP_CUSTOMERS",
    },
    axiosConfig: {
      responseType: "blob",
    },
  });

  return mutation;
};
