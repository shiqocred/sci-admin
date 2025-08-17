import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    fileKtp: string;
    fileKta: string;
    storefront: string;
    role: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN";
    newRole: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN";
    name: string | null;
    userId: string;
    nik: string | null;
    noKta: string | null;
  };
};

export const useGetReviewUpgrade = ({ id }: { id: string }) => {
  const query = useApiQuery<Response>({
    key: ["customers-review", { id }],
    endpoint: `/admin/customers/${id}/review`,
    enabled: !!id,
  });
  return query;
};
