import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    id: string;
    question: string;
    answer: string;
  };
};

export const useGetFaq = ({
  faqId,
  edit,
}: {
  faqId: string;
  edit: boolean;
}) => {
  const query = useApiQuery<Response>({
    key: ["faq", faqId],
    endpoint: `/admin/settings/faqs/${faqId}`,
    enabled: !!faqId && edit,
  });
  return query;
};
