import { useApiQuery } from "@/lib/query/use-query";
import { dataMutate, dataQuery } from "./data";
import { useMutate } from "@/lib/query";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export const useGetDetailBanner = ({ id }: { id: string }) =>
  useApiQuery(dataQuery(id).show);

export const useUpdateBanner = () => {
  const router = useRouter();
  return useMutate(dataMutate(useQueryClient(), router).update);
};
