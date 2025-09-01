import { useApiQuery } from "@/lib/query/use-query";

export type Variant = {
  id: string;
  name: string | null;
  price: string;
  quantity: string;
};

export type ProductOutput = {
  id: string | null;
  name: string | null;
  image: string | null;
  default_variant: Variant | null;
  variant: Variant[] | null;
};

export type ShippingStatus =
  | "CONFIRMED"
  | "SCHEDULED"
  | "ALLOCATED"
  | "PICKING_UP"
  | "PICKED"
  | "CANCELLED"
  | "ON_HOLD"
  | "DROPPING_OFF"
  | "RETURN_IN_TRANSIT"
  | "RETURNED"
  | "REJECTED"
  | "DISPOSED"
  | "COURIER_NOT_FOUND"
  | "DELIVERED"
  | "PENDING";

export type HistoriesExistProps = {
  id: string;
  updatedAt: Date | null;
  status: ShippingStatus;
  shippingId: string;
  note: string | null;
  serviceType: string | null;
};

export type PricingProps = {
  products: string;
  total: string;
  amount: string | null;
  discount: string | null;
  shipping: string;
  isFreeShiping: boolean;
};

export type UserProps = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  total_orders: number;
};

export type PaymentProps = {
  status: "CANCELLED" | "PENDING" | "EXPIRED" | "PAID" | null;
  channel: string | null;
  method: string | null;
};

export type CourierProps = {
  waybill: string | null;
  name: string | null;
  company: string | null;
  type: string | null;
};

export type ContactProps = {
  name: string | null;
  phone: string | null;
  address: string | null;
  address_note: string | null;
  latitude: string | null;
  longitude: string | null;
};

export type ShippingProps = {
  id: string | null;
  duration: "HOUR" | "DAY" | null;
  status: ShippingStatus;
  courier: CourierProps;
  contact: ContactProps;
};

export type TimestampProps = {
  expired: string | null;
  cancelled: string | null;
  paid: string | null;
  shipping: string | null;
  created: string | null;
  delivered: string | null;
};

export type OrderProps = {
  id: string;
  status: string;
  note: string | null;
  pricing: PricingProps;
  user: UserProps;
  payment: PaymentProps;
  shipping: ShippingProps;
  timestamp: TimestampProps;
  products: ProductOutput[];
  histories: HistoriesExistProps[];
};

type Response = {
  data: OrderProps;
};

export const useGetOrder = ({ id }: { id: string }) => {
  return useApiQuery<Response>({
    key: ["order-detail", id],
    endpoint: `/admin/orders/${id}`,
  });
};
