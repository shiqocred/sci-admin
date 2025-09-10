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

export async function GET(req: NextRequest) {
  const inline = req.nextUrl.searchParams.get("inline") === "1";

  const orderId = "h44cj6j32hsvpp8bmsclafp8";

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

  const data: InvoiceData = {
    orderNo: orderId,
    transactionDate: format(orderData.transactionDate ?? new Date(), "P", {
      locale: id,
    }),
    paymentMethod:
      formatPayment(orderData.paymentMethod, orderData.paymentMethod) ?? "",
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

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="invoice.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
