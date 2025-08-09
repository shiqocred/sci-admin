import { PaginationMeta } from "@/lib/pagination/fastPaginate";
import { useApiQuery } from "@/lib/query/use-query";

type Variant = {
  id: string;
  name: string | null;
  price: string;
  quantity: string;
};

type ProductOutput = {
  id: string | null;
  name: string | null;
  image: string | null;
  default_variant: Variant | null;
  variant: Variant[] | null;
};

type Response = {
  data: {
    id: string;
    product_price: string;
    total_price: string;
    status: string;
    userId: string;
    name: string;
    email: string;
    image: string | null;
    toal_orders: string;
    invoice_status: string;
    paymentChannel: string | null;
    paymentMethod: string | null;
    amount: string;
    expiredAt: string | null;
    paidAt: string | null;
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_address_note: string;
    shipping_latitude: string;
    shipping_longitude: string;
    shipping_tracking_id: string | null;
    shipping_waybill_id: string | null;
    shipping_courier_name: string;
    shipping_courierCompany: string;
    shipping_courierType: string;
    shipping_price: string;
    shipping_duration: string;
    shipping_status: string;
    products: ProductOutput[];
  };
};

export const useGetOrder = ({ id }: { id: string }) => {
  return useApiQuery<Response>({
    key: ["order-detail", id],
    endpoint: `/admin/orders/${id}`,
  });
};
