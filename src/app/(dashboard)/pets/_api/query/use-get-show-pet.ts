import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    id: string;
    name: string;
    slug: string;
  };
};

export const useGetShowPet = ({
  petId,
  open,
}: {
  petId: string;
  open: boolean;
}) => {
  const query = useApiQuery<Response>({
    key: ["pet-show", { petId }],
    endpoint: `/admin/pets/${petId}`,
    enabled: !!petId && open,
  });
  return query;
};
