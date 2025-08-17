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
        toal_orders:
          sql`(SELECT ${countDistinct(orders.id)} FROM ${orders} WHERE ${orders.userId} = ${users.id})`.as(
            "orders"
          ),
        invoice_status: invoices.status,
        paymentChannel: invoices.paymentChannel,
        paymentMethod: invoices.paymentMethod,
        amount: invoices.amount,
        expiredAt: invoices.expiredAt,
        cancelledAt: invoices.cancelledAt,
        paidAt: invoices.paidAt,
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

    const response = {
      ...{
        ...orderRes,
        status: formatStatus(orderRes.status),
        image: orderRes.image ? `${r2Public}/${orderRes.image}` : null,
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

    const store = await db.query.storeDetail.findFirst();

    const addressSelected = await db.query.shippings.findFirst({
      where: (as, { eq }) => eq(as.orderId, orderId),
    });

    const orderItemsExist = await db
      .select({
        name: productVariants.name,
        quantity: orderItems.quantity,
        weight: orderItems.weight,
      })
      .from(orderItems)
      .innerJoin(productVariants, eq(productVariants.id, orderItems.variantId))
      .where(eq(orderItems.orderId, orderId));

    if (!store) return errorRes("Store detail missing, please seed data", 400);
    if (!addressSelected)
      return errorRes("Order not found or no address selected", 400);

    const requestBody = {
      origin_contact_name: store.name,
      origin_contact_phone: store.phone,
      origin_address: store.address,
      origin_coordinate: {
        latitude: store.latitude,
        longitude: store.longitude,
      },
      destination_contact_name: addressSelected.name,
      destination_contact_phone: addressSelected.phone,
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
        name: product.name,
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

    console.log(biteshipRes);

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
        .set({ status: "SHIPPING" })
        .where(eq(orders.id, orderId));
    });

    return successRes({ id: orderId }, "Order successfully shipped");
  } catch (error) {
    console.error("ERROR_SEND_ORDER:", error);
    return errorRes("Internal Error", 500);
  }
}

// const a = {
//   success: true,
//   message: "Order successfully created",
//   object: "order",
//   id: "68977a4b033d76001262dc47",
//   shipper: {
//     name: "Sehat Cerah Indonesia",
//     email: "sci.ecommerce1@gmail.com",
//     phone: "6287788659059",
//     organization: "Personal Account",
//   },
//   origin: {
//     contact_name: "PT Sehat Cerah Indonesia",
//     contact_phone: "0217228383",
//     coordinate: {
//       latitude: -0.9723010999999999,
//       longitude: 116.7132419,
//     },
//     address:
//       "Jl. Negara, Pemaluan, Kec. Sepaku, Kabupaten Penajam Paser Utara, Kalimantan Timur 76147, Indonesia",
//     note: "-",
//     postal_code: 76147,
//     collection_method: "pickup",
//   },
//   destination: {
//     contact_name: "kokoko",
//     contact_phone: "+62 88888888888",
//     address:
//       "Jl. P. Sudirman No.9, Tayu Kulon, Kecamatan Tayu, Kabupaten Pati, Jawa Tengah, Indonesia 59155",
//     note: "jojojo",
//     proof_of_delivery: {
//       use: false,
//       fee: 0,
//       note: null,
//       link: null,
//     },
//     cash_on_delivery: {
//       id: null,
//       amount: 0,
//       fee: 0,
//       amountCurrency: "IDR",
//       feeCurrency: "IDR",
//       note: null,
//       type: null,
//       status: null,
//       payment_status: "pending",
//       payment_method: "cash",
//     },
//     coordinate: {
//       latitude: -6.5376626,
//       longitude: 111.0452983,
//     },
//     postal_code: 59155,
//   },
//   stops: [],
//   courier: {
//     tracking_id: "vf9wCLZL7nrnpNqjbdRc62na",
//     waybill_id: "WYB-1754757707554",
//     company: "jnt",
//     name: null,
//     phone: null,
//     type: "ez",
//     link: "https://track.biteship.com/vf9wCLZL7nrnpNqjbdRc62na?environment=development",
//     insurance: {
//       amount: 0,
//       fee: 0,
//       note: "",
//       amount_currency: "IDR",
//       fee_currency: "IDR",
//     },
//     routing_code: null,
//   },
//   delivery: {
//     datetime: "2025-08-09T23:41+07:00",
//     note: null,
//     type: "now",
//     distance: 1230.3,
//     distance_unit: "kilometer",
//   },
//   reference_id: "dtcquig2e4cpeujlhrem7qcl",
//   items: [
//     {
//       name: "30L",
//       description: "Goods",
//       category: "others",
//       sku: null,
//       value: 10000,
//       quantity: 10,
//       length: 1,
//       width: 1,
//       height: 1,
//       weight: 100,
//     },
//     {
//       name: "50L",
//       description: "Goods",
//       category: "others",
//       sku: null,
//       value: 10000,
//       quantity: 1,
//       length: 1,
//       width: 1,
//       height: 1,
//       weight: 11,
//     },
//     {
//       name: "default",
//       description: "Goods",
//       category: "others",
//       sku: null,
//       value: 10000,
//       quantity: 3,
//       length: 1,
//       width: 1,
//       height: 1,
//       weight: 100,
//     },
//   ],
//   extra: [],
//   currency: "IDR",
//   tax_lines: [],
//   price: 58000,
//   status: "confirmed",
//   draft_order_id: null,
// };
