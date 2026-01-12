import { auth, errorRes } from "@/lib/auth";
import { addresses, db, users } from "@/lib/db";
import { formatRole } from "@/lib/utils";
import { and, eq, isNull, not } from "drizzle-orm";
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

    const customersRaw = await db
      .select({
        id: users.id,
        name: users.name,
        phone: users.phoneNumber,
        role: users.role,
        address: {
          address: addresses.address,
          detail: addresses.detail,
          province: addresses.province,
          city: addresses.city,
          district: addresses.district,
          postalCode: addresses.postalCode,
        },
      })
      .from(users)
      .leftJoin(
        addresses,
        and(
          isNull(addresses.deletedAt),
          eq(addresses.userId, users.id),
          eq(addresses.isDefault, true),
        ),
      )
      .where(and(not(eq(users.role, "ADMIN")), isNull(users.deletedAt)));

    const customersFormatted = customersRaw.map((customer) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      role: customer.role,
      address: customer.address?.address
        ? `${customer.address?.address}, ${customer.address?.detail}, ${customer.address?.district}, ${customer.address?.city}, ${customer.address?.province} ${customer.address?.postalCode}, Indonesia`
        : "-",
    }));

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Customers");

    ws.columns = [
      { header: "CustomerType", key: "customerType" },
      { header: "CustomerAccount", key: "customerAccount" },
      { header: "Name", key: "customerName" },
      { header: "OnHold", key: "onHold" },
      { header: "Customer Groups", key: "customerGroups" },
      { header: "Currency", key: "currency" },
      { header: "Terms of payment", key: "paymentTerms" },
      { header: "Tax Group", key: "taxGroup" },
      { header: "SalesDistrict", key: "salesDistrict" },
      { header: "EmployeeResponsible", key: "employeeResponsible" },

      { header: "AddressDescription", key: "addressDescription" },
      { header: "AddressStreet", key: "addressStreet" },
      { header: "AddressZipCode", key: "addressZipCode" },
      { header: "AddressArea", key: "addressArea" },
      { header: "AddressCountryRegionID", key: "addressCountryRegionId" },
      { header: "Contact person", key: "contactPerson" },
      { header: "Phone", key: "phone" },
      { header: "Telex", key: "telex" },
      { header: "Email", key: "email" },
      { header: "Fax", key: "fax" },
      { header: "NPWP No.", key: "npwpNumber" },
      { header: "NPWP Name", key: "npwpName" },
      { header: "NPWP Address", key: "npwpAddress" },
      { header: "Virtual Account No.", key: "virtualAccountNumber" },
      { header: "Rebate Group", key: "rebateGroup" },
      { header: "Kode Area", key: "areaCode" },
      { header: "Credit Limit", key: "creditLimit" },
      { header: "NIK No.", key: "nikNumber" },
      { header: "LanguageID", key: "languageId" },
      { header: "Jenis Transaksi", key: "transactionType" },
      { header: "Detail Transaksi", key: "transactionDetail" },
      { header: "Dokument Transaksi", key: "transactionDocument" },
      { header: "Kode Jenis Transaksi", key: "transactionTypeCode" },
      { header: "Nomor PKP", key: "pkpNumber" },
      { header: "Tanggal Pengukuhan", key: "pkpApprovalDate" },
      { header: "", key: "reserved" },
      { header: "RPT 14", key: "rpt14" },
      { header: "Bank Code", key: "bankCode" },
      { header: "Organization Number", key: "organizationNumber" },
      { header: "Warehouse", key: "warehouse" },
      { header: "Customer Rebate Group", key: "customerRebateGroup" },
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

    for (const row of customersFormatted)
      ws.addRow({
        customerName: row.name,
        addressStreet: row.address,
        phone: `0${row.phone.split(" ")[1]}`,
        organizationNumber: row.id,
        customerRebateGroup: formatRole(row.role),
      });

    autoFitColumns(ws, headerRow.number);
    applyDataStyle(ws, headerRow.number);

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="erp_costumers.xlsx"',
      },
    });
  } catch {}
}
