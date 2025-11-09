import { dataMutate } from "./data";
import { useMutate } from "@/lib/query";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export const useCreateBanner = () => {
  const router = useRouter();
  return useMutate(dataMutate(useQueryClient(), router).create);
};
