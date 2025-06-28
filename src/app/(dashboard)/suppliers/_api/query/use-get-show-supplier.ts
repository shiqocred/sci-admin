import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  };
};

export const useGetShowSupplier = ({
  supplierId,
  open,
}: {
  supplierId: string;
  open: boolean;
}) => {
  const query = useApiQuery<Response>({
    key: ["supplier-show", { supplierId }],
    endpoint: `/admin/suppliers/${supplierId}`,
    enabled: !!supplierId && open,
  });
  return query;
};
