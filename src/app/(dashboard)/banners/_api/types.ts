import { PaginationMeta } from "@/lib/pagination";
import { CheckedState } from "@radix-ui/react-checkbox";

// query
export type BannerProps = {
  id: string;
  name: string;
  image: string | null;
  status: string;
  apply: string;
};

export type BannerResponse = {
  data: {
    data: BannerProps[];
    pagination: PaginationMeta;
  };
};

export type GetBannerProps = {
  q: string;
  p: number;
  limit: number;
  sort: string;
  order: string;
};

export type SelectItemsProps = {
  name: string;
  id: string;
};

export type SelectResponse = {
  data: {
    categories: SelectItemsProps[];
    pets: SelectItemsProps[];
    promos: SelectItemsProps[];
    products: SelectItemsProps[];
    suppliers: SelectItemsProps[];
  };
};

// mutate
export type BannerParams = { id: string };

export type BannerUpdateBody = {
  status: boolean;
};

// all
export type BannerInput = {
  name: string;
  apply: "detail" | "categories" | "suppliers" | "pets" | "promos";
  selected: string[];
  image: File | null;
  startDate: Date;
  startTime: string;
  endDate: Date | undefined;
  endTime: string;
  isEnd: CheckedState | undefined;
};
