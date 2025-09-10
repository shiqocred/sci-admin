import { baseUrl } from "@/config";
import { numberToTerbilang } from "@/lib/utils";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

export type OrderItem = {
  no: number;
  productName: string;
  unitPrice: number;
  qty: number;
  sku: string;
  subtotal: number;
};

export type InvoiceData = {
  orderNo: string;
  transactionDate: string;
  paymentMethod: string;
  subtotalProducts: number;
  shippingSubtotal: number;
  totalDiscount: number;
  totalPayment: number;
  isFreeShipping: boolean;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;

  // Footer note
  issuer: {
    name: string; // "PT Shopee International Indonesia"
    addressLines: string; // lines of address
  };

  items: OrderItem[];
};

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 10, color: "#111" },
  h1: { fontSize: 14, fontWeight: "bold", marginBottom: 8 },
  section: { marginBottom: 12 },
  lineHeight: { lineHeight: 1 },
  paddingTop1: { paddingTop: 1 },
  row: { flexDirection: "row" },
  col: { flex: 1 },
  label: { fontWeight: "semibold" },
  val: { color: "#555" },
  card: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
  },

  // header grid
  grid2: { flexDirection: "row", gap: 10 },
  grid2Col: { flex: 1 },

  // table
  table: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
  },
  thead: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderColor: "#d1d5db",
  },
  th: { padding: 6, fontWeight: "bold" },
  td: { padding: 6 },
  cNo: { width: 24 },
  cName: { flex: 3 },
  cVar: { flex: 1 },
  cPrice: { width: 70, textAlign: "right" as const },
  cQty: { width: 40, textAlign: "right" as const },
  cSub: { width: 80, textAlign: "right" as const },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#d1d5db" },
  trLast: { flexDirection: "row" },

  // totals
  totals: { marginTop: 8, gap: 4 },
  line: { flexDirection: "row" },
  lineLabel: {
    flex: 1,
    color: "#444",
    paddingRight: 8,
  },
  lineValue: { width: 100, textAlign: "right" },

  // small muteds
  muted: { color: "#6B7280" },

  footerCard: { marginTop: 10, color: "#444" },
});

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export const invoicePDF = ({
  data,
  title = "Order Invoice",
}: {
  data: InvoiceData;
  title?: string;
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={`${baseUrl}/images/logo-sci.png`}
              style={{ width: 90 }}
            />
            <View
              style={{
                maxWidth: 300,
                marginLeft: 10,
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                {data.issuer.name}
              </Text>
              <Text
                style={{
                  lineHeight: 1.3,
                  marginTop: 5,
                  fontSize: 9,
                  color: "#6b7280",
                }}
              >
                {data.issuer.addressLines}
              </Text>
            </View>
          </View>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderWidth: 1,
              borderRadius: 5,
              borderColor: "#d1d5db",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "bold" }}>{title}</Text>
          </View>
        </View>
        {/* Header */}
        <View>
          <Text style={{ marginBottom: 10, fontWeight: "bold" }}>
            Buyer Information
          </Text>
          <View
            style={[
              {
                backgroundColor: "#f3f4f6",
                paddingTop: 13,
                paddingBottom: 8,
                paddingHorizontal: 15,
                borderRadius: 8,
                marginBottom: 20,
              },
            ]}
          >
            <Text
              style={{
                paddingVertical: 3,
              }}
            >
              <Text style={styles.label}>Name: </Text>
              <Text style={styles.val}>{data.buyerName}</Text>
            </Text>
            <Text
              style={{
                paddingVertical: 3,
              }}
            >
              <Text style={styles.label}>Phone: </Text>
              <Text style={styles.val}>{data.buyerPhone}</Text>
            </Text>
            <Text
              style={{
                paddingVertical: 3,
              }}
            >
              <Text style={styles.label}>Address: </Text>
              <Text style={[styles.val, { lineHeight: 0.8 }]}>
                {data.buyerAddress}
              </Text>
            </Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <View style={{ display: "flex", gap: 3 }}>
              <Text style={styles.label}>Order Id</Text>
              <Text style={styles.val}>{data.orderNo}</Text>
            </View>
            <View style={{ display: "flex", gap: 3 }}>
              <Text style={styles.label}>Transaction Date</Text>
              <Text style={styles.val}>{data.transactionDate}</Text>
            </View>
            <View style={{ display: "flex", gap: 3 }}>
              <Text style={styles.label}>Payment Method</Text>
              <Text style={styles.val}>{data.paymentMethod}</Text>
            </View>
          </View>
        </View>

        {/* Tabel Rincian Pesanan */}
        <View style={[styles.section]}>
          <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
            Order Details
          </Text>
          <View style={[styles.table]}>
            <View style={styles.thead}>
              <Text style={[styles.th, styles.cNo, { paddingLeft: 6 }]}>
                No.
              </Text>
              <Text style={[styles.th, styles.cVar]}>SKU</Text>
              <Text style={[styles.th, styles.cName]}>Product</Text>
              <Text style={[styles.th, styles.cPrice]}>Price</Text>
              <Text style={[styles.th, styles.cQty]}>Qty</Text>
              <Text style={[styles.th, styles.cSub, { paddingRight: 6 }]}>
                Subtotal
              </Text>
            </View>
            {data.items.map((it, idx) => (
              <View
                key={it.no}
                style={
                  idx + 1 === data.items.length ? styles.trLast : styles.tr
                }
              >
                <Text style={[styles.td, styles.cNo, { paddingLeft: 6 }]}>
                  {it.no}
                </Text>
                <Text style={[styles.td, styles.cVar]}>{it.sku}</Text>
                <Text style={[styles.td, styles.cName]}>{it.productName}</Text>
                <Text style={[styles.td, styles.cPrice]}>
                  {idr(it.unitPrice)}
                </Text>
                <Text style={[styles.td, styles.cQty]}>{it.qty}</Text>
                <Text style={[styles.td, styles.cSub, { paddingRight: 6 }]}>
                  {idr(it.subtotal)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ringkasan Pembayaran */}
        <View
          style={[
            styles.card,
            { width: 250, marginLeft: "auto", gap: 5, marginBottom: 20 },
          ]}
        >
          <View style={styles.line}>
            <Text style={styles.lineLabel}>Order Subtotal</Text>
            <Text style={styles.lineValue}>{idr(data.subtotalProducts)}</Text>
          </View>
          <View style={styles.line}>
            <Text style={styles.lineLabel}>Shipping Subtotal</Text>
            <Text style={styles.lineValue}>{idr(data.shippingSubtotal)}</Text>
          </View>
          {data.totalDiscount > 0 && (
            <View style={styles.line}>
              <Text style={styles.lineLabel}>Total Discount</Text>
              <Text style={styles.lineValue}>-{idr(data.totalDiscount)}</Text>
            </View>
          )}
          {data.isFreeShipping && (
            <View style={styles.line}>
              <Text style={styles.lineLabel}>Total Shipping Discount</Text>
              <Text style={styles.lineValue}>
                -{idr(Math.abs(data.shippingSubtotal))}
              </Text>
            </View>
          )}
          <View
            style={[
              styles.line,
              { paddingTop: 8, borderTopWidth: 0.5, marginTop: 4 },
            ]}
          >
            <Text style={[styles.lineLabel, { fontWeight: "bold" }]}>
              Total Payment
            </Text>
            <Text style={[styles.lineValue, { fontWeight: "bold" }]}>
              {idr(data.totalPayment)}
            </Text>
          </View>
        </View>

        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderRadius: 5,
            width: "100%",
            textAlign: "center",
            borderColor: "#d1d5db",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderBottomWidth: 1,
              borderColor: "#d1d5db",
              width: "100%",
              backgroundColor: "#f3f4f6",
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
            }}
          >
            Terbilang
          </Text>
          <Text
            style={{
              padding: 10,
              textTransform: "uppercase",
              width: "100%",
            }}
          >
            {numberToTerbilang(data.totalPayment)}
          </Text>
          <Text
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderTopWidth: 1,
              borderColor: "#d1d5db",
              width: "100%",
              backgroundColor: "#f3f4f6",
              borderBottomLeftRadius: 5,
              borderBottomRightRadius: 5,
              fontSize: 9,
            }}
          >
            End of receipt
          </Text>
        </View>
      </Page>
    </Document>
  );
};
