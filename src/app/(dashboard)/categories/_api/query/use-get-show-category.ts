import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  };
};

export const useGetShowCategory = ({
  categoryId,
  open,
}: {
  categoryId: string;
  open: boolean;
}) => {
  const query = useApiQuery<Response>({
    key: ["category-show", { categoryId }],
    endpoint: `/admin/categories/${categoryId}`,
    enabled: !!categoryId && open,
  });
  return query;
};
