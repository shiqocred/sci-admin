import { auth, errorRes } from "@/lib/auth";
import {
  categories,
  db,
  pets,
  productAvailableRoles,
  products,
  productToPets,
  productVariants,
  roleUserEnum,
  suppliers,
} from "@/lib/db";
import { formatRole, formattedDateServer } from "@/lib/utils";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

type RoleType = (typeof roleUserEnum)["enumValues"];
type RequestProps = {
  suppliers: string[];
  pets: string[];
  roles: string[];
  categories: string[];
  isAllRole: boolean;
  isAllSupplier: boolean;
  isAllPet: boolean;
  isAllCategory: boolean;
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
      suppliers: suppliersRes,
      pets: petsRes,
      roles: rolesRes,
      categories: categoriesRes,
      isAllRole,
      isAllSupplier,
      isAllPet,
      isAllCategory,
    } = body;

    const filters: any[] = [];

    if (suppliersRes.length) filters.push(inArray(suppliers.id, suppliersRes));
    if (petsRes.length) filters.push(inArray(pets.id, petsRes));
    if (rolesRes.length)
      filters.push(
        inArray(
          productAvailableRoles.role,
          rolesRes.map((r) => r.toUpperCase()) as RoleType
        )
      );
    if (categoriesRes.length)
      filters.push(inArray(suppliers.id, categoriesRes));

    // === Query top customers ===
    const rows = await db
      .select({
        sku: productVariants.sku,
        productName: products.name,
        variantName: productVariants.name,
        stock: productVariants.stock,
        availableFor: sql<
          string[]
        >`COALESCE(array_to_json(ARRAY_AGG(DISTINCT ${productAvailableRoles.role})), '[]'::json)`.as(
          "availableFor"
        ),
      })
      .from(products)
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(
        productAvailableRoles,
        eq(productAvailableRoles.productId, products.id)
      )
      .leftJoin(suppliers, eq(suppliers.id, products.supplierId))
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .leftJoin(productToPets, eq(productToPets.productId, products.id))
      .leftJoin(pets, eq(pets.id, productToPets.petId))
      .where(and(...filters))
      .groupBy(
        productVariants.sku,
        products.name,
        productVariants.name,
        productVariants.stock,
        products.createdAt
      )
      .orderBy(asc(products.createdAt));

    const rowFormatted = rows.map((i) => ({
      sku: i.sku,
      name:
        i.variantName === "default"
          ? i.productName
          : `${i.productName} - ${i.variantName}`,
      stock: Number(i.stock ?? "0"),
      availableFor:
        i.availableFor.length === 3
          ? "All Customers"
          : i.availableFor.map((i) => formatRole(i)).join(", "),
    }));

    let supplierRes = [] as { name: string }[];
    let categoryRes = [] as { name: string }[];
    let petRes = [] as { name: string }[];

    if (suppliersRes.length) {
      supplierRes = await db.query.suppliers.findMany({
        columns: { name: true },
        where: (s, { inArray }) => inArray(s.id, suppliersRes),
      });
    }
    if (categoriesRes.length) {
      categoryRes = await db.query.categories.findMany({
        columns: { name: true },
        where: (c, { inArray }) => inArray(c.id, categoriesRes),
      });
    }
    if (petsRes.length) {
      petRes = await db.query.pets.findMany({
        columns: { name: true },
        where: (p, { inArray }) => inArray(p.id, petsRes),
      });
    }

    // === Workbook setup ===
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Top Customers");

    ws.columns = [
      { header: "SKU", key: "sku" },
      { header: "Product Name", key: "name" },
      { header: "Stock", key: "stock" },
      { header: "Available For", key: "availableFor" },
    ];

    // === Title ===
    const lastCol = ws.getColumn(ws.columns.length).letter;
    ws.mergeCells(`A1:${lastCol}1`);
    const title = ws.getCell("A1");
    title.value = "ITEM LISTING REPORT (BASED ON DASHBOARD)";
    title.font = { bold: true, size: 16 };
    title.alignment = { horizontal: "center", vertical: "middle" };

    // === Info Section ===
    ws.addRow([]);
    const infoStart = 3;
    const infoData = [
      [
        "Available For:",
        isAllRole
          ? "All Customer Categories"
          : rolesRes.map((i) => formatRole(i)).join(", "),
      ],
      [
        "Filter by Categories:",
        isAllCategory
          ? "All Categories"
          : categoryRes.map((i) => i.name).join(", "),
      ],
      [
        "Filter by Supplier:",
        isAllSupplier
          ? "All Suppliers"
          : supplierRes.map((i) => i.name).join(", "),
      ],
      [
        "Filter by Pet:",
        isAllPet ? "All Pets" : petRes.map((i) => i.name).join(", "),
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
    [3, 4, 5, 6].forEach((rowNumber) => {
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

    const sCol = ws.getColumn("stock");

    // mulai dari row ke-10 sampai akhir data
    sCol.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber >= 10) {
        cell.numFmt = "#,##0;[Red] -#,##0";
      }
    });

    // === Return as Excel File ===
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="item_listing_report.xlsx"',
      },
    });
  } catch (err) {
    console.error("ERROR_DOWNLOAD_EXPORT:", err);
    return errorRes("Internal Error", 500);
  }
}
