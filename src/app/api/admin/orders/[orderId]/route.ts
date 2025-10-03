import { r2Public } from "@/config";
import { createOrder, getTracking } from "@/lib/action";
import { auth, errorRes, successRes } from "@/lib/auth";
import {
  db,
  invoices,
  orderItems,
  orders,
  productImages,
  products,
  productVariants,
  shippingHistories,
  shippings,
  users,
} from "@/lib/db";
import { pronoun } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
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

type Histories = {
  note: string;
  service_type: string;
  status: any;
  updated_at: string;
};

type HistoriesExist = {
  id: string;
  updatedAt: Date | null;
  status:
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
  shippingId: string;
  note: string | null;
  serviceType: string | null;
};

const formatStatus = (
  status:
    | "WAITING_PAYMENT"
    | "PACKING"
    | "SHIPPING"
    | "DELIVERED"
    | "EXPIRED"
    | "CANCELLED"
) => {
  if (status === "WAITING_PAYMENT") return "waiting payment";
  if (status === "PACKING") return "processed";
  if (status === "SHIPPING") return "shipping";
  if (status === "DELIVERED") return "delivered";
  if (status === "EXPIRED") return "expired";
  return "canceled";
};

const formatVariant = async (
  variants: {
    product_id: string | null;
    product_name: string | null;
    product_image: unknown;
    variant_id: string;
    variant_name: string | null;
    variant_price: string;
    variant_quantity: string;
    variant_is_default: boolean | null;
  }[]
) => {
  const productsRes: Record<string, ProductOutput> = {};

  for (const item of variants) {
    if (!item.product_id) return;
    if (!productsRes[item.product_id]) {
      productsRes[item.product_id] = {
        id: item.product_id,
        name: item.product_name,
        image: item.product_image ? `${r2Public}/${item.product_image}` : null,
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

  return productsRes;
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
        note: orders.note,
        userId: orders.userId,
        name: users.name,
        email: users.email,
        image: users.image,
        total_orders:
          sql`(SELECT ${countDistinct(orders.id)} FROM ${orders} WHERE ${orders.userId} = ${users.id})`.as(
            "orders"
          ),
        invoice_status: invoices.status,
        paymentChannel: invoices.paymentChannel,
        paymentMethod: invoices.paymentMethod,
        amount: invoices.amount,
        total_discount: orders.totalDiscount,
        expiredAt: orders.expiredAt,
        cancelledAt: orders.cancelledAt,
        paidAt: orders.paidAt,
        shippingAt: orders.shippingAt,
        createdAt: orders.createdAt,
        deliveredAt: orders.deliveredAt,
        freeShippingId: orders.freeShippingId,
        shipping_id: shippings.id,
        shipping_name: shippings.name,
        shipping_phone: shippings.phone,
        shipping_address: shippings.address,
        shipping_address_note: shippings.address_note,
        shipping_latitude: shippings.latitude,
        shipping_longitude: shippings.longitude,
        shipping_waybill_id: shippings.waybillId,
        shipping_courier_name: shippings.courierName,
        shipping_courierCompany: shippings.courierCompany,
        shipping_courierType: shippings.courierType,
        shipping_price: orders.shippingPrice,
        shipping_duration: shippings.duration,
        shipping_fast: shippings.fastestEstimate,
        shipping_long: shippings.longestEstimate,
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
         ORDER BY ${productImages.position} ASC 
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

    const shippingId = orderRes.shipping_id;

    let histories: HistoriesExist[] = [];

    if (shippingId) {
      const historiesExist = await db.query.shippingHistories.findMany({
        where: (sh, { eq }) => eq(sh.shippingId, shippingId),
      });

      histories = historiesExist;
    }

    const productRes = await formatVariant(orderItemsRes);

    const resultProduct = productRes ? Object.values(productRes) : [];

    const formatShippingDuration = (
      fastest: string | null,
      longest: string | null,
      unit?: string | null
    ) => {
      if (!unit) return "";
      if (fastest === longest)
        return `${fastest} ${unit.toLowerCase()}${pronoun(Number(fastest))}`;
      return `${fastest} - ${longest} ${unit.toLowerCase()}${pronoun(Number(longest))}`;
    };

    const response = {
      id: orderRes.id,
      status: formatStatus(orderRes.status),
      note: orderRes.note,
      pricing: {
        products: orderRes.product_price,
        total: orderRes.total_price,
        amount: orderRes.amount,
        discount: orderRes.total_discount,
        shipping: orderRes.shipping_price,
        isFreeShiping: !!orderRes.freeShippingId,
      },
      user: {
        id: orderRes.userId,
        name: orderRes.name,
        email: orderRes.email,
        image: orderRes.image ? `${r2Public}/${orderRes.image}` : null,
        total_orders: orderRes.total_orders,
      },
      payment: {
        status: orderRes.invoice_status,
        channel: orderRes.paymentChannel,
        method: orderRes.paymentMethod,
      },
      timestamp: {
        expired: orderRes.expiredAt
          ? format(orderRes.expiredAt, "PPP 'at' HH:mm", { locale: id })
          : null,
        cancelled: orderRes.cancelledAt
          ? format(orderRes.cancelledAt, "PPP 'at' HH:mm", { locale: id })
          : null,
        paid: orderRes.paidAt
          ? format(orderRes.paidAt, "PPP 'at' HH:mm", { locale: id })
          : null,
        shipping: orderRes.shippingAt
          ? format(orderRes.shippingAt, "PPP 'at' HH:mm", { locale: id })
          : null,
        created: orderRes.createdAt
          ? format(orderRes.createdAt, "PPP 'at' HH:mm", { locale: id })
          : null,
        delivered: orderRes.deliveredAt
          ? format(orderRes.deliveredAt, "PPP 'at' HH:mm", { locale: id })
          : null,
      },
      shipping: {
        id: orderRes.shipping_id,
        duration: formatShippingDuration(
          orderRes.shipping_fast,
          orderRes.shipping_long,
          orderRes.shipping_duration
        ),
        status: orderRes.shipping_status,
        courier: {
          waybill: orderRes.shipping_waybill_id,
          name: orderRes.shipping_courier_name,
          company: orderRes.shipping_courierCompany,
          type: orderRes.shipping_courierType,
        },
        contact: {
          name: orderRes.shipping_name,
          phone: orderRes.shipping_phone,
          address: orderRes.shipping_address,
          address_note: orderRes.shipping_address_note,
          latitude: orderRes.shipping_latitude,
          longitude: orderRes.shipping_longitude,
        },
      },
      products: resultProduct,
      histories: histories.length > 0 ? histories : null,
    };

    return successRes(response, "Retrieve detail order");
  } catch (error) {
    console.error("ERROR_GET_ORDER:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { orderId } = await params;

    const store = await db.query.about.findFirst();

    const addressSelected = await db.query.shippings.findFirst({
      where: (as, { eq }) => eq(as.orderId, orderId),
    });

    const orderItemsExist = await db
      .select({
        productName: products.name,
        variantName: productVariants.name,
        quantity: orderItems.quantity,
        weight: orderItems.weight,
      })
      .from(orderItems)
      .leftJoin(productVariants, eq(productVariants.id, orderItems.variantId))
      .leftJoin(products, eq(products.id, productVariants.productId))
      .where(eq(orderItems.orderId, orderId));

    if (!store) return errorRes("Store detail missing, please seed data", 400);
    if (!addressSelected)
      return errorRes("Order not found or no address selected", 400);

    const requestBody = {
      origin_contact_name: store.name,
      origin_contact_phone: store.phone,
      origin_address: store.shipping_address,
      origin_coordinate: {
        latitude: store.latitude,
        longitude: store.longitude,
      },
      destination_contact_name: addressSelected.name,
      destination_contact_phone: `0${addressSelected.phone.split(" ")[1]}`,
      destination_address: addressSelected.address,
      destination_note: addressSelected.address_note,
      destination_coordinate: {
        latitude: addressSelected.latitude,
        longitude: addressSelected.longitude,
      },
      courier_company: addressSelected.courierCompany,
      courier_type: addressSelected.courierType,
      delivery_type: "now",
      reference_id: orderId,
      items: orderItemsExist.map((product) => ({
        name: `${product.productName}${product.variantName === "default" ? "" : " - " + product.variantName}`,
        weight: product.weight,
        quantity: product.quantity,
      })),
    };

    const { ok: orderOk, response: biteshipRes } =
      await createOrder(requestBody);

    if (!orderOk) return errorRes(`Failed to send, ${biteshipRes.error}`, 400);

    const biteship = {
      collection_method: biteshipRes.origin.collection_method,
      tracking: biteshipRes.courier.tracking_id,
      waybill: biteshipRes.courier.waybill_id,
      status: biteshipRes.status,
    };

    const { ok: historiesOk, response: historiesRes } = await getTracking(
      biteship.tracking
    );

    if (!historiesOk)
      return errorRes(`Failed to get histories, ${historiesRes.error}`, 400);

    const historiesFormatted: Histories[] = historiesRes.history;

    const historiesExist = await db.query.shippingHistories.findMany({
      where: (sh, { eq }) => eq(sh.shippingId, addressSelected.id),
    });

    const existingSet = new Set(
      historiesExist.map(
        (h) =>
          `${(h.note ?? "").trim()}|${new Date(h.updatedAt ?? new Date()).getTime()}|${h.status.toUpperCase()}`
      )
    );

    // 3️⃣ Filter hanya data yang belum ada
    const filteredNew = historiesFormatted.filter(
      (h) =>
        !existingSet.has(
          `${h.note.trim()}|${new Date(h.updated_at).getTime()}|${h.status.toUpperCase()}`
        )
    );

    await db.transaction(async (tx) => {
      if (filteredNew.length > 0) {
        await tx.insert(shippingHistories).values(
          filteredNew.map((history) => ({
            shippingId: addressSelected.id,
            status: history.status.toUpperCase(),
            note: history.note,
            serviceType: history.service_type,
            updatedAt: new Date(history.updated_at),
          }))
        );
      }
      await tx
        .update(shippings)
        .set({
          collectionMethod: biteship.collection_method,
          trackingId: biteship.tracking,
          waybillId: biteship.waybill,
          status: biteship.status.toUpperCase(),
        })
        .where(eq(shippings.id, addressSelected.id));
      await tx
        .update(orders)
        .set({
          status: "SHIPPING",
          shippingAt: sql`NOW()`,
          updatedAt: sql`NOW()`,
        })
        .where(eq(orders.id, orderId));
    });

    return successRes({ id: orderId }, "Order successfully shipped");
  } catch (error) {
    console.error("ERROR_SEND_ORDER:", error);
    return errorRes("Internal Error", 500);
  }
}
