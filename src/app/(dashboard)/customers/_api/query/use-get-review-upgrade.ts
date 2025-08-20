import { useApiQuery } from "@/lib/query/use-query";

export type ReviewProps = {
  personalIdFile: string | null;
  storefrontFile: string | null;
  veterinarianIdFile: string | null;
  role: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN";
  userId: string;
  newRole: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN";
  personalIdType: "NIK" | "NIB" | "NPWP";
  personalId: string | null;
  veterinarianId: string | null;
  fullName: string | null;
};

type Response = {
  data: ReviewProps;
};

export const useGetReviewUpgrade = ({ id }: { id: string }) => {
  const query = useApiQuery<Response>({
    key: ["customers-review", { id }],
    endpoint: `/admin/customers/${id}/review`,
    enabled: !!id,
  });
  return query;
};
