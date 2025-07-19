import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    id: string;
    name: string;
  }[];
};

export const useGetSelectCategories = () => {
  const query = useApiQuery<Response>({
    key: ["categories-select"],
    endpoint: "/admin/categories/select",
  });
  return query;
};

export const useGetSelectSuppliers = () => {
  const query = useApiQuery<Response>({
    key: ["suppliers-select"],
    endpoint: "/admin/suppliers/select",
  });
  return query;
};
export const useGetSelectPets = () => {
  const query = useApiQuery<Response>({
    key: ["pets-select"],
    endpoint: "/admin/pets/select",
  });
  return query;
};
