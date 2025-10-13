import { auth, errorRes } from "@/lib/auth";
import {
  db,
  orderItems,
  orders,
  products,
  productVariants,
  suppliers,
  users,
} from "@/lib/db";
import { formattedDateServer } from "@/lib/utils";
import { and, desc, eq, gte, inArray, lte, sql, sum } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

type RequestProps = {
  suppliers: string[];
  products: string[];
  periodStart: string | null;
  periodEnd: string | null;
  isAllPeriod: boolean;
  isSameDate: boolean;
  type: string;
  isAllSupplier: boolean;
  isAllProduct: boolean;
};

// === Utility: Auto-fit columns ===
function autoFitColumns(worksheet: ExcelJS.Worksheet, startRow: number) {
  worksheet.columns.forEach((col) => {
    const column = col as ExcelJS.Column;
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

export async function POST(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const body: RequestProps = await req.json();
    const {
      suppliers: suppliersReq,
      products: productsReq,
      periodStart,
      periodEnd,
      isAllPeriod,
      isAllSupplier,
      isAllProduct,
      type,
      isSameDate,
    } = body;

    const filters: any[] = [];

    if (type === "product" && productsReq.length)
      filters.push(inArray(orderItems.variantId, productsReq));

    if (type === "supplier" && suppliersReq.length)
      filters.push(inArray(suppliers.id, suppliersReq));

    if (!isAllPeriod && periodStart && periodEnd)
      filters.push(
        and(
          gte(orders.createdAt, new Date(periodStart)),
          lte(orders.createdAt, new Date(periodEnd))
        )
      );

    // === Query top customers ===
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        amountSpent: sql`COALESCE(${sum(orders.totalPrice)}, 0)`.as(
          "amountSpent"
        ),
      })
      .from(users)
      .leftJoin(orders, eq(orders.userId, users.id))
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .leftJoin(productVariants, eq(productVariants.id, orderItems.variantId))
      .leftJoin(products, eq(products.id, productVariants.productId))
      .leftJoin(suppliers, eq(suppliers.id, products.supplierId))
      .where(and(...filters))
      .groupBy(users.id)
      .orderBy(desc(sql`COALESCE(${sum(orders.totalPrice)}, 0)`));

    const rowFormatted = rows.map((i) => ({
      ...i,
      amountSpent: Number((i.amountSpent as string) ?? "0"),
    }));

    // === Additional info for filters ===
    let productRes = [] as {
      name: string;
      sku: string | null;
      variantName: string | null;
    }[];
    let supplierRes = [] as { name: string }[];

    if (type === "product" && productsReq.length > 0 && !isAllProduct) {
      productRes = await db
        .select({
          name: products.name,
          sku: productVariants.sku,
          variantName: productVariants.name,
        })
        .from(products)
        .leftJoin(productVariants, eq(productVariants.productId, products.id))
        .where(inArray(productVariants.id, productsReq));
    }

    if (type === "supplier" && suppliersReq.length > 0 && !isAllSupplier) {
      supplierRes = await db.query.suppliers.findMany({
        columns: { name: true },
        where: (s, { inArray }) => inArray(s.id, suppliersReq),
      });
    }

    // === Workbook setup ===
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Top Customers");

    ws.columns = [
      { header: "Customer ID", key: "id" },
      { header: "Customer Name", key: "name" },
      { header: "Amount After Tax", key: "amountSpent" },
    ];

    // === Title ===
    const lastCol = ws.getColumn(ws.columns.length).letter;
    ws.mergeCells(`A1:${lastCol}1`);
    const title = ws.getCell("A1");
    title.value = "REPORT TOP CUSTOMERS";
    title.font = { bold: true, size: 16 };
    title.alignment = { horizontal: "center", vertical: "middle" };

    // === Info Section ===
    ws.addRow([]);
    const infoStart = 3;
    const infoData = [
      [
        "Filter by Product:",
        isAllProduct
          ? "All Products"
          : productRes
              .map(
                (i) =>
                  `(${i.sku ?? "-"}) ${i.name}${
                    i.variantName === "default" ? "" : " - " + i.variantName
                  }`
              )
              .join(", "),
      ],
      [
        "Filter by Supplier:",
        isAllSupplier
          ? "All Suppliers"
          : supplierRes.map((i) => i.name).join(", "),
      ],
      [
        "Period:",
        isAllPeriod
          ? "All Period"
          : isSameDate
            ? formattedDateServer(periodStart, "PPP")
            : `${formattedDateServer(periodStart, "PPP")} - ${formattedDateServer(
                periodEnd,
                "PPP"
              )}`,
      ],
      [
        "Exported Date:",
        formattedDateServer(new Date().toISOString(), "PPP 'at' HH:mm"),
      ],
      ["Total Customers:", rowFormatted.length],
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

    // === Adjust row height dynamically for rows 3 and 4 ===
    [3, 4, 5].forEach((rowNumber) => {
      const cell = ws.getCell(`B${rowNumber}`);
      const text = (cell.value || "").toString();
      const approxLines = Math.ceil(text.length / 50); // kira-kira 50 karakter per baris
      const baseHeight = 15; // tinggi dasar Excel per baris teks
      const padding = 6; // tambahan ruang agar tidak mepet
      ws.getRow(rowNumber).height = baseHeight * approxLines + padding;
    });

    ws.addRow([]);

    // === Header Row ===
    const headerRow = ws.addRow(ws.columns.map((c) => c.header));
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
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
    for (const row of rowFormatted) ws.addRow(row);

    autoFitColumns(ws, headerRow.number);
    applyDataStyle(ws, headerRow.number);

    const amCol = ws.getColumn("amountSpent");

    // mulai dari row ke-10 sampai akhir data
    amCol.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber >= 10) {
        cell.numFmt = '"Rp" #,##0;[Red]"Rp" -#,##0';
      }
    });

    // === Return as Excel File ===
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="top_customers_report.xlsx"',
      },
    });
  } catch (err) {
    console.error("ERROR_DOWNLOAD_EXPORT:", err);
    return errorRes("Internal Error", 500);
  }
}
