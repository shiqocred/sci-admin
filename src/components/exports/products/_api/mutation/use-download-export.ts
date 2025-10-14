import { useMutate } from "@/lib/query";
import { toast } from "sonner";

type Body = {
  suppliers: string[];
  pets: string[];
  roles: string[];
  categories: string[];
  isAllRole: boolean;
  isAllSupplier: boolean;
  isAllPet: boolean;
  isAllCategory: boolean;
};

export const useDownloadExport = () => {
  const mutation = useMutate<Body>({
    endpoint: "/admin/products/export",
    method: "post",
    onSuccess: async () => {
      toast.success("Products Data Downloaded");
    },
    onError: {
      title: "DOWNLOAD_PRODUCTS",
    },
    axiosConfig: {
      responseType: "blob",
    },
  });

  return mutation;
};
