import { roleUserEnum } from "@/lib/db";

export type DashboardRangeProps = {
  mode: string;
  from: string;
  to: string;
};

export type DashboardResponse = {
  data: {
    total: {
      customers: string;
      income: string;
      order: string;
    };
    needed: {
      approve_document: {
        id: string;
        name: string;
        role: (typeof roleUserEnum)["enumValues"][number];
      }[];
      confirm_order: {
        id: string;
        date: string;
      }[];
    };
  };
};

export type TotalRange = {
  order: number;
  amount: number;
};

export type CustomersRange = {
  amount: string;
  id: string;
  name: string;
};

export type OrderRange = {
  date: string;
  income: string;
  order: string;
};

export type RangeResponse = {
  data: {
    orders: OrderRange[];
    customers: CustomersRange[];
    total: TotalRange;
  };
};
