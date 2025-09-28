import { useApiQuery } from "@/lib/query/use-query";

type Role = "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN";
type UpgradeStatus = "PENDING" | "REJECTED" | "APPROVED";
type PersonalIdType = "NIK" | "NIB" | "NPWP";
type OrderStatus =
  | "WAITING_PAYMENT"
  | "PACKING"
  | "SHIPPING"
  | "DELIVERED"
  | "EXPIRED"
  | "CANCELLED";

type Order = {
  id: string;
  status: OrderStatus;
};

type Address = {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  detail: string;
};

type Customer = {
  personalIdFile: string | null;
  storefrontFile: string | null;
  veterinarianIdFile: string | null;
  name: string;
  createdAt: string;
  email: string | null;
  emailVerified: boolean;
  id: string;
  image: string | null;
  phoneNumber: string;
  updatedAt: boolean;
  newRole: Role | null;
  fullName: string | null;
  message: string | null;
  personalId: string | null;
  personalIdType: PersonalIdType | null;
  role: Role | null;
  status: UpgradeStatus | null;
  veterinarianId: string | null;
  totalOrder: number;
  totalAmount: number;
  lastOrder: string;
  orders: Order[];
  addresses: Address[];
};

type Response = {
  data: Customer;
};

export const useGetCustomer = ({ userId }: { userId: string }) => {
  const query = useApiQuery<Response>({
    key: ["customers-detail", userId],
    endpoint: `/admin/customers/${userId}`,
  });
  return query;
};
