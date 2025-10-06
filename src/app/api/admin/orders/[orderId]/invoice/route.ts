// app/api/invoice/[orderNo]/route.ts
import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { type InvoiceData, invoicePDF } from "@/components/pdf/invoice";
import {
  db,
  invoices,
  orderItems,
  orders,
  products,
  productVariants,
  shippings,
} from "@/lib/db";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Paksa runtime Node.js (bukan Edge) agar React-PDF jalan lancar
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BANK_MAP: Record<string, string> = {
  BRI: "Bank BRI",
  BSI: "Bank BSI",
  BCA: "Bank BCA",
  BNI: "Bank BNI",
  BJB: "Bank BJB",
  BNC: "Bank Neo",
  PERMATA: "Bank Permata",
  SAMPOERNA: "Bank Samoerna",
  CIMB: "Bank CIMB Niaga",
  MANDIRI: "Bank Mandiri",
  MUAMALAT: "Bank Muamalat",
};

const EWALLET_MAP: Record<string, string> = {
  SHOPEEPAY: "ShopeePay",
  ASTRAPAY: "AstraPay",
  JENIUSPAY: "JeniusPay",
  DANA: "DANA",
  LINKAJA: "Link Aja",
  OVO: "OVO",
  GOPAY: "GOPAY",
  NEXCASH: "Nex Cash",
};

const formatPayment = (method: string | null, channel: string | null) => {
  if (!method || !channel) return null;
  if (method === "BANK_TRANSFER") return BANK_MAP[channel] ?? "Bank Muamalat";
  if (method === "EWALLET") return EWALLET_MAP[channel] ?? "Nex Cash";
  if (method === "CREDIT_CARD") return "Credit Card";
  if (method === "DIRECT_DEBIT")
    return channel === "DD_MANDIRI"
      ? "Direct Debit Mandiri"
      : "Direct Debit BRI";
  if (method === "QR_CODE" && channel === "QRIS") return "QRIS";
  return "ADMIN";
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  const [[orderData], items, store] = await Promise.all([
    db
      .select({
        orderId: orders.id,
        transactionDate: orders.paidAt,
        freeShipping: orders.freeShippingId,
        productPrice: orders.productPrice,
        shippingPrice: orders.shippingPrice,
        totalDiscount: orders.totalDiscount,
        totalPrice: orders.totalPrice,
        buyerName: shippings.name,
        buyerPhone: shippings.phone,
        buyerAddress: shippings.address,
        buyerAddress_note: shippings.address_note,
        paymentChannel: invoices.paymentChannel,
        paymentMethod: invoices.paymentMethod,
      })
      .from(orders)
      .leftJoin(shippings, eq(shippings.orderId, orders.id))
      .leftJoin(invoices, eq(invoices.orderId, orders.id))
      .where(eq(orders.id, orderId))
      .limit(1),
    db
      .select({
        sku: productVariants.sku,
        productName: products.name,
        variantName: productVariants.name,
        price: orderItems.price,
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .leftJoin(productVariants, eq(productVariants.id, orderItems.variantId))
      .leftJoin(products, eq(products.id, productVariants.productId))
      .where(eq(orderItems.orderId, orderId)),
    db.query.about.findFirst({
      columns: {
        name: true,
        address: true,
      },
    }),
  ]);

  const dateISO = orderData.transactionDate
    ? new Date(orderData.transactionDate.toISOString())
    : null;

  const formattedDate = () => {
    if (dateISO) {
      const GMTime = dateISO.getTime() + 7 * 60 * 60 * 1000;
      const formatted = format(new Date(GMTime), "P", { locale: id });

      return formatted;
    }

    return "-";
  };

  const data: InvoiceData = {
    orderNo: orderId,
    transactionDate: formattedDate(),
    paymentMethod:
      formatPayment(orderData.paymentMethod, orderData.paymentChannel) ?? "",
    subtotalProducts: Number(orderData.productPrice),
    shippingSubtotal: Number(orderData.shippingPrice),
    totalDiscount: Number(orderData.totalDiscount),
    totalPayment: Number(orderData.totalPrice),
    isFreeShipping: !!orderData.freeShipping,
    buyerName: orderData.buyerName ?? "",
    buyerPhone: orderData.buyerPhone ?? "",
    buyerAddress: `${orderData.buyerAddress_note}, ${orderData.buyerAddress}`,
    issuer: {
      name: store?.name ?? "",
      addressLines: store?.address ?? "",
    },
    items: items.map((i, idx) => ({
      no: idx + 1,
      productName: `${i.productName}${i.variantName === "default" ? "" : " - " + i.variantName}`,
      unitPrice: Number(i.price),
      qty: Number(i.quantity),
      sku: i.sku ?? "",
      subtotal: Number(i.price) * Number(i.quantity),
    })),
  };

  // Render React-PDF → Buffer
  const pdfBuffer = await renderToBuffer(invoicePDF({ data }));

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${orderId}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
