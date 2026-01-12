import { auth, errorRes } from "@/lib/auth";
import {
  db,
  orderItems,
  orders,
  products,
  productVariants,
  users,
} from "@/lib/db";
import { formatRole } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { eq } from "drizzle-orm";
import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

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

function applyDataStyle(worksheet: ExcelJS.Worksheet, startRow: number) {
  const totalCols = worksheet.columnCount;

  worksheet.eachRow({ includeEmpty: true }, (row, r) => {
    if (r < startRow) return;

    for (let c = 1; c <= totalCols; c++) {
      const cell = row.getCell(c);

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      cell.alignment = {
        vertical: "middle",
        wrapText: true,
      };
    }
  });
}

export async function POST() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const ordersRaw = await db
      .select({
        id: orders.id,
        sku: productVariants.sku,
        quantity: orderItems.quantity,
        unit: products.packaging,
        price: orderItems.price,
        discount: orderItems.discountPrice,
        userId: users.id,
        role: users.role,
        date: orders.paidAt,
      })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.userId))
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .leftJoin(productVariants, eq(productVariants.id, orderItems.variantId))
      .leftJoin(products, eq(products.id, productVariants.productId))
      .where(eq(orders.status, "DELIVERED"));

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Customers");

    ws.columns = [
      { header: "Customer Account", key: "customerAccount" },
      { header: "Customer ID", key: "customerId" },
      { header: "Customer Category", key: "customerCategory" },
      { header: "Order ID", key: "orderId" },
      { header: "Sales Order ID", key: "salesOrderId" },
      { header: "Item Number", key: "itemNumber" },
      { header: "Quantity", key: "quantity" },
      { header: "Unit", key: "unit" },
      { header: "Price", key: "price" },
      { header: "Discount", key: "discount" },
      { header: "Order Date", key: "date" },
    ];

    const headerRow = ws.getRow(1);
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

    for (const row of ordersRaw)
      ws.addRow({
        customerId: row.userId,
        customerCategory: formatRole(row.role ?? ""),
        orderId: row.id,
        itemNumber: row.sku,
        quantity: row.quantity,
        unit: row.unit,
        price: row.price,
        discount: row.discount,
        date: row.date ? format(row.date, "PPP HH:mm", { locale: id }) : "-",
      });

    autoFitColumns(ws, headerRow.number);
    applyDataStyle(ws, headerRow.number);

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="erp_orders.xlsx"',
      },
    });
  } catch {}
}
