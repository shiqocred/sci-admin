import { roleUserEnum } from "@/lib/db";
import { PaginationMeta } from "@/lib/pagination";
import { GetListProps } from "@/lib/utils";

type UserEnum = (typeof roleUserEnum)["enumValues"][number];

export type GetCustomerIdParamsProps = { id: string };

// query
export type CustomersProps = {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
};

export type OptionProps = {
  minOrder: string;
  maxOrder: string;
  minSpent: string;
  maxSpent: string;
};

export type CustomersListResponse = {
  data: {
    data: CustomersProps[];
    pagination: PaginationMeta;
    option: OptionProps;
    current: OptionProps;
  };
};

export type GetCustomersParamsProps = GetListProps & {
  role: string[];
  status: string;
  approval: boolean;
  minOrder: string;
  maxOrder: string;
  minSpent: string;
  maxSpent: string;
};

export type CustomerReviewProps = {
  personalIdFile: string | null;
  storefrontFile: string | null;
  veterinarianIdFile: string | null;
  role: UserEnum;
  userId: string;
  newRole: UserEnum;
  personalIdType: "NIK" | "NIB" | "NPWP";
  personalId: string | null;
  veterinarianId: string | null;
  fullName: string | null;
};

export type GetCustomerReviewProps = {
  data: CustomerReviewProps;
};

// mutate
export type UpdateReviewBody = {
  status: "approve" | "reject";
  message?: string;
};
