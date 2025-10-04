import { useApiQuery } from "@/lib/query/use-query";

export type BannerProps = {
  name: string;
  imageOld: string;
  apply: string;
  selected: string[];
  startAt: string;
  endAt: string | undefined;
  isEnd: boolean;
  status: string;
};

type Response = {
  data: BannerProps;
};

export const useGetBanner = ({ id }: { id: string }) => {
  const query = useApiQuery<Response>({
    key: ["banner-detail", id],
    endpoint: `/admin/banners/${id}`,
    enabled: !!id,
  });
  return query;
};
