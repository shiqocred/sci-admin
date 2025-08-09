import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import {
  db,
  invoices,
  orderItems,
  orders,
  productImages,
  products,
  productVariants,
  shippings,
  users,
} from "@/lib/db";
import { countDistinct, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { orderId } = await params;

    const [orderRes] = await db
      .select({
        id: orders.id,
        product_price: orders.productPrice,
        total_price: orders.totalPrice,
        status: orders.status,
        userId: orders.userId,
        name: users.name,
        email: users.email,
        image: users.image,
        toal_orders:
          sql`(SELECT ${countDistinct(orders.id)} FROM ${orders} WHERE ${orders.userId} = ${users.id})`.as(
            "orders"
          ),
        invoice_status: invoices.status,
        paymentChannel: invoices.paymentChannel,
        paymentMethod: invoices.paymentMethod,
        amount: invoices.amount,
        expiredAt: invoices.expiredAt,
        paidAt: invoices.paidAt,
        shipping_name: shippings.name,
        shipping_phone: shippings.phone,
        shipping_address: shippings.address,
        shipping_address_note: shippings.address_note,
        shipping_latitude: shippings.latitude,
        shipping_longitude: shippings.longitude,
        shipping_tracking_id: shippings.trackingId,
        shipping_waybill_id: shippings.waybillId,
        shipping_courier_name: shippings.courierName,
        shipping_courierCompany: shippings.courierCompany,
        shipping_courierType: shippings.courierType,
        shipping_price: orders.shippingPrice,
        shipping_duration: shippings.duration,
        shipping_status: shippings.status,
      })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.userId))
      .leftJoin(invoices, eq(invoices.orderId, orders.id))
      .leftJoin(shippings, eq(shippings.orderId, orders.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderRes) return errorRes("Order not found", 400);

    const orderItemsRes = await db
      .select({
        product_id: products.id,
        product_name: products.name,
        product_image: sql`
        (SELECT ${productImages.url} 
         FROM ${productImages} 
         WHERE ${productImages.productId} = ${products.id} 
         ORDER BY ${productImages.createdAt} ASC 
         LIMIT 1)`.as("product_image"),
        variant_id: orderItems.variantId,
        variant_name: productVariants.name,
        variant_price: orderItems.price,
        variant_quantity: orderItems.quantity,
        variant_is_default: productVariants.isDefault,
      })
      .from(orderItems)
      .leftJoin(productVariants, eq(productVariants.id, orderItems.variantId))
      .leftJoin(products, eq(products.id, productVariants.productId))
      .where(eq(orderItems.orderId, orderId));

    const productsRes: Record<string, ProductOutput> = {};

    for (const item of orderItemsRes) {
      if (!item.product_id) return;
      if (!productsRes[item.product_id]) {
        productsRes[item.product_id] = {
          id: item.product_id,
          name: item.product_name,
          image: item.product_image
            ? `${r2Public}/${item.product_image}`
            : null,
          default_variant: null,
          variant: null,
        };
      }

      const variantObj: Variant = {
        id: item.variant_id,
        name: item.variant_name,
        price: item.variant_price,
        quantity: item.variant_quantity,
      };

      if (item.variant_is_default) {
        productsRes[item.product_id].default_variant = variantObj;
      } else {
        if (!productsRes[item.product_id].variant) {
          productsRes[item.product_id].variant = [];
        }
        productsRes[item.product_id].variant!.push(variantObj);
      }
    }

    const resultProduct = Object.values(productsRes);

    const response = {
      ...{
        ...orderRes,
        image: orderRes.image ? `${r2Public}/${orderRes.image}` : null,
      },
      products: resultProduct,
    };

    return successRes(response, "Retrieve detail order");
  } catch (error) {
    console.error("ERROR_GET_ORDER:", error);
    return errorRes("Internal Error", 500);
  }
}
