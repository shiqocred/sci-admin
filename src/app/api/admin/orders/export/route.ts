import { auth, errorRes } from "@/lib/auth";
import {
  categories,
  db,
  invoices,
  orderItems,
  orders,
  orderStatusEnum,
  products,
  productVariants,
  roleUserEnum,
  shippings,
  suppliers,
  users,
} from "@/lib/db";
import {
  formatOrderStatus,
  formatPayment,
  formatRole,
  formatRupiah,
  formattedDateServer,
} from "@/lib/utils";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

type OrderType = (typeof orderStatusEnum)["enumValues"];
type RoleType = (typeof roleUserEnum)["enumValues"];
type RequestProps = {
  statuses: string[];
  customers: string[];
  roles: string[];
  products: string[];
  periodStart: string | null;
  periodEnd: string | null;
  isAllPeriod: boolean;
  isSameDate: boolean;
  type: string;
  isAllRole: boolean;
  isAllStatus: boolean;
  isAllCustomer: boolean;
  isAllProduct: boolean;
};

// === Utility: Grouping Orders ===
function groupOrders(rows: any[]) {
  const map: Record<string, any> = {};

  const rupiahFormatted = (value: string | number) => {
    if (!value) return "-";
    return formatRupiah(value);
  };

  for (const row of rows) {
    if (!map[row.id]) {
      map[row.id] = {
        id: row.id,
        orderAt: formattedDateServer(row.orderAt, "PPP 'at' HH:mm"),
        paidAt: formattedDateServer(row.paidAt, "PPP 'at' HH:mm"),
        shippingAt: formattedDateServer(row.shippingAt, "PPP 'at' HH:mm"),
        status: formatOrderStatus(row.status),
        couriers: row.couriers ?? "-",
        waybill: row.waybill ?? "-",
        customerId: row.customerId,
        customerName: row.customerName,
        customerRole: formatRole(row.customerRole ?? ""),
        paymentMethod:
          formatPayment(row.paymentMethod, row.paymentChannel) ?? "-",
        productCategory: row.productCategory,
        productSupplier: row.productSupplier,
        shippingAddress:
          `${row.shippingAddressNote ?? ""}, ${row.shippingAddress ?? ""}`.trim(),
        orderDiscount: rupiahFormatted(row.orderDiscount),
        productPrice: rupiahFormatted(row.productPrice),
        shippingCost: rupiahFormatted(row.shippingCost),
        totalPrice: rupiahFormatted(row.totalPrice),
        products: [],
      };
    }

    map[row.id].products.push({
      sku: row.skuVariant,
      name:
        row.variantName === "default"
          ? row.productName
          : `${row.productName} - ${row.variantName}`,
      qty: Number(row.productQty ?? 0),
    });
  }

  return Object.values(map);
}

// === Utility: Auto-fit columns (skip header/info) ===
function autoFitColumns(worksheet: ExcelJS.Worksheet, startRow: number) {
  worksheet.columns.forEach((col) => {
    const column = col as ExcelJS.Column;
    if (!column) return;
    let max = 10;
    column.eachCell({ includeEmpty: true }, (cell, rowNum) => {
      if (rowNum < startRow) return;
      const len = cell.value ? cell.value.toString().length : 0;
      if (len > max) max = len;
    });
    column.width = max + 2;
  });
}

// === Utility: Apply Border & Align for data rows ===
function applyDataStyle(worksheet: ExcelJS.Worksheet, startRow: number) {
  worksheet.eachRow((row, r) => {
    if (r < startRow) return;
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle", wrapText: true };
    });
  });
}

// === Main Export ===
export async function POST(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const body: RequestProps = await req.json();
    const {
      statuses,
      customers,
      roles,
      products: productReq,
      periodStart,
      periodEnd,
      isAllPeriod,
      isSameDate,
      type,
      isAllRole,
      isAllStatus,
      isAllCustomer,
      isAllProduct,
    } = body;

    const filters = [];

    if (statuses.length)
      filters.push(
        inArray(
          orders.status,
          statuses.map((s) =>
            s === "processed" ? "PACKING" : s.replace("-", "_").toUpperCase()
          ) as OrderType
        )
      );

    if (type === "role" && roles.length)
      filters.push(
        inArray(users.role, roles.map((r) => r.toUpperCase()) as RoleType)
      );

    if (type === "customer" && customers.length)
      filters.push(inArray(users.id, customers));

    if (productReq.length)
      filters.push(inArray(orderItems.variantId, productReq));

    if (!isAllPeriod && periodStart && periodEnd)
      filters.push(
        and(
          gte(orders.createdAt, new Date(periodStart)),
          lte(orders.createdAt, new Date(periodEnd))
        )
      );

    // === Query ===
    const rows = await db
      .select({
        id: orders.id,
        orderAt: orders.createdAt,
        paidAt: orders.paidAt,
        shippingAt: orders.shippingAt,
        status: orders.status,
        couriers: shippings.courierCompany,
        waybill: shippings.waybillId,
        customerId: orders.userId,
        customerName: users.name,
        customerRole: users.role,
        paymentMethod: invoices.paymentMethod,
        paymentChannel: invoices.paymentChannel,
        productCategory: categories.name,
        productSupplier: suppliers.name,
        shippingAddress: shippings.address,
        shippingAddressNote: shippings.address_note,
        orderDiscount: orders.totalDiscount,
        productPrice: orders.productPrice,
        shippingCost: orders.shippingPrice,
        totalPrice: orders.totalPrice,
        skuVariant: productVariants.sku,
        productName: products.name,
        variantName: productVariants.name,
        productQty: orderItems.quantity,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .leftJoin(users, eq(users.id, orders.userId))
      .leftJoin(shippings, eq(shippings.orderId, orders.id))
      .leftJoin(invoices, eq(invoices.orderId, orders.id))
      .leftJoin(productVariants, eq(productVariants.id, orderItems.variantId))
      .leftJoin(products, eq(products.id, productVariants.productId))
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .leftJoin(suppliers, eq(suppliers.id, products.supplierId))
      .where(and(...filters))
      .orderBy(desc(orders.createdAt));

    // === Grouping ===
    const grouped = groupOrders(rows);

    // === Distinct Info ===
    const distinctCustomers = [...new Set(grouped.map((o) => o.customerName))];
    const distinctProducts = [
      ...new Set(grouped.flatMap((o) => o.products.map((p: any) => p.name))),
    ];

    // === Workbook ===
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Orders");

    ws.columns = [
      { header: "Order ID", key: "id" },
      { header: "Order Date", key: "orderAt" },
      { header: "Paid Date", key: "paidAt" },
      { header: "Shipping Date", key: "shippingAt" },
      { header: "Courier", key: "couriers" },
      { header: "Waybill", key: "waybill" },
      { header: "Status", key: "status" },
      { header: "Customer ID", key: "customerId" },
      { header: "Customer Name", key: "customerName" },
      { header: "Customer Category", key: "customerRole" },
      { header: "Address", key: "shippingAddress" },
      { header: "Payment Method", key: "paymentMethod" },
      { header: "Product Category", key: "productCategory" },
      { header: "Product Supplier", key: "productSupplier" },
      { header: "SKU", key: "sku" },
      { header: "Product Name", key: "productName" },
      { header: "Qty", key: "qty" },
      { header: "Discount", key: "orderDiscount" },
      { header: "Product Price", key: "productPrice" },
      { header: "Shipping Cost", key: "shippingCost" },
      { header: "Total Price", key: "totalPrice" },
    ];

    // === Title ===
    const totalCols = ws.columns.length;
    const lastCol = ws.getColumn(totalCols).letter;
    ws.mergeCells(`A1:${lastCol}1`);
    const title = ws.getCell("A1");
    title.value = "REPORT DETAILS (BASED ON DASHBOARD)";
    title.font = { bold: true, size: 16 };
    title.alignment = { horizontal: "center", vertical: "middle" };

    // === Info Section ===
    ws.addRow([]);
    const infoStart = 3;
    const infoData = [
      [
        "Filter by Status:",
        isAllStatus
          ? "All Statuses"
          : statuses.map((i) => i.replace("-", " ")).join(", "),
      ],
      [
        "Period:",
        isAllPeriod
          ? "All Period"
          : isSameDate
            ? formattedDateServer(periodStart, "PPP")
            : `${formattedDateServer(periodStart, "PPP")} - ${formattedDateServer(periodEnd, "PPP")}`,
      ],
      [
        "Customer Name:",
        isAllCustomer ? "All Customers" : distinctCustomers.join(", "),
      ],
      [
        "Customer Category:",
        isAllRole
          ? "All Customer Categories"
          : roles.map((r) => formatRole(r.toUpperCase())).join(", "),
      ],
      ["Product:", isAllProduct ? "All Products" : distinctProducts.join(", ")],
      [
        "Exported Date:",
        formattedDateServer(new Date().toISOString(), "PPP 'at' HH:mm"),
      ],
      ["Total Order:", grouped.length],
    ];

    infoData.forEach(([label, val], i) => {
      const r = infoStart + i;
      ws.mergeCells(`B${r}:C${r}`);
      ws.getCell(`A${r}`).value = label;
      ws.getCell(`B${r}`).value = val;
      ["A", "B", "C"].forEach((col) => {
        const c = ws.getCell(`${col}${r}`);
        c.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4ade80" },
        };
        c.alignment = { vertical: "middle", wrapText: true };
        if (col === "A") c.font = { bold: true };
      });
    });

    ws.addRow([]);

    // === Header Row ===
    const headerRow = ws.addRow(ws.columns.map((c) => c.header));
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // === Data Rows ===
    let rowStart = headerRow.number + 1;
    for (const order of grouped) {
      const products = order.products ?? [];
      for (const p of products) {
        ws.addRow({
          ...order,
          sku: p.sku,
          productName: p.name,
          qty: p.qty,
        });
      }

      if (products.length > 1) {
        const endRow = rowStart + products.length - 1;
        const mergeCols = [
          "A",
          "B",
          "C",
          "D",
          "E",
          "F",
          "G",
          "H",
          "I",
          "J",
          "K",
          "L",
          "M",
          "N",
          "R",
          "S",
          "T",
          "U",
        ];
        mergeCols.forEach((col) =>
          ws.mergeCells(`${col}${rowStart}:${col}${endRow}`)
        );
      }

      rowStart += products.length;
    }

    autoFitColumns(ws, headerRow.number);
    applyDataStyle(ws, headerRow.number);

    // === Return Buffer ===
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="orders_report.xlsx"',
      },
    });
  } catch (err) {
    console.error("ERROR_DOWNLOAD_EXPORT:", err);
    return errorRes("Internal Error", 500);
  }
}
