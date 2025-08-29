import { useApiQuery } from "@/lib/query/use-query";

export type DetailReviewProps = {
  id: string;
  title: string;
  rating: number;
  description: string;
  timestamp: string;
  status: string;
  images: (string | null)[];
  orderId: string;
  product: {
    id: string;
    name: string;
  }[];
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
};

type Response = {
  data: DetailReviewProps;
};

export const useGetShowReview = ({ reviewId }: { reviewId: string }) => {
  const query = useApiQuery<Response>({
    key: ["review", reviewId],
    endpoint: `/admin/reviews/${reviewId}`,
    enabled: !!reviewId,
  });
  return query;
};
