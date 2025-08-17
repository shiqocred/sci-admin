import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    id: string;
    title: string;
    description: string;
    indication: string;
    dosageUsage: string;
    storageInstruction: string;
    packaging: string;
    registrationNumber: string;
    status: boolean;
    category: {
      id: string | null;
      name: string | null;
    };
    supplier: {
      id: string | null;
      name: string | null;
    };
    images: string[];
    pets: {
      id: string;
      name: string;
    }[];
    compositions: {
      id: string;
      name: string;
      value: string;
    }[];
    variants: {
      id: string;
      name: string;
      isDefault: boolean;
      price: string;
      sku: string;
      barcode: string;
      stock: string;
      weight: string;
      pricing: {
        role: string;
        price: string;
      }[];
    }[];
    available: string[];
  };
};

export const useGetShowProduct = ({ productId }: { productId: string }) => {
  const query = useApiQuery<Response>({
    key: ["show-product", productId],
    endpoint: `/admin/products/${productId}`,
  });
  return query;
};
