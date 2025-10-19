import { auth, errorRes } from "@/lib/auth";
import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { db, userRoleDetails, users } from "@/lib/db";
import { and, eq, isNull } from "drizzle-orm";
import { formatRole, formattedDateServer } from "@/lib/utils";
import { getR2Buffer } from "@/lib/providers";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);
    const userId = (await params).customerId;

    const [userDetail] = await db
      .select({
        name: users.name,
        createdAt: users.createdAt,
        email: users.email,
        emailVerified: users.emailVerified,
        id: users.id,
        image: users.image,
        phoneNumber: users.phoneNumber,
        upgradeAt: userRoleDetails.updatedAt,
        newRole: userRoleDetails.newRole,
        fullName: userRoleDetails.fullName,
        message: userRoleDetails.message,
        personalId: userRoleDetails.personalId,
        personalIdFile: userRoleDetails.personalIdFile,
        personalIdType: userRoleDetails.personalIdType,
        role: userRoleDetails.role,
        status: userRoleDetails.status,
        storefrontFile: userRoleDetails.storefrontFile,
        veterinarianId: userRoleDetails.veterinarianId,
        veterinarianIdFile: userRoleDetails.veterinarianIdFile,
      })
      .from(users)
      .leftJoin(userRoleDetails, eq(userRoleDetails.userId, users.id))
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .groupBy(
        users.id,
        userRoleDetails.updatedAt,
        userRoleDetails.newRole,
        userRoleDetails.fullName,
        userRoleDetails.message,
        userRoleDetails.personalId,
        userRoleDetails.personalIdFile,
        userRoleDetails.personalIdType,
        userRoleDetails.role,
        userRoleDetails.status,
        userRoleDetails.storefrontFile,
        userRoleDetails.veterinarianId,
        userRoleDetails.veterinarianIdFile
      );

    const addressesList = await db.query.addresses.findMany({
      columns: {
        id: true,
        name: true,
        address: true,
        city: true,
        province: true,
        district: true,
        postalCode: true,
        phoneNumber: true,
        detail: true,
      },
      where: (a, { eq }) => eq(a.userId, userId),
    });

    if (!userDetail) return errorRes("User data not match", 404);

    // Helper to fetch optional image buffer
    async function optionalR2Buffer(file?: string | null) {
      return file ? await getR2Buffer(file) : null;
    }
    const personalIdFile = await optionalR2Buffer(userDetail.personalIdFile);
    const storefrontFile =
      userDetail.newRole === "PETSHOP"
        ? await optionalR2Buffer(userDetail.storefrontFile)
        : null;
    const veterinarianIdFile =
      userDetail.newRole === "VETERINARIAN"
        ? await optionalR2Buffer(userDetail.veterinarianIdFile)
        : null;

    const detailFormatted = {
      ...userDetail,
      personalIdType:
        userDetail.newRole === "VETERINARIAN" ||
        userDetail.personalIdType === "NIK"
          ? "KTP"
          : userDetail.personalIdType,
      role: userDetail.role && formatRole(userDetail.role),
      newRole: userDetail.newRole && formatRole(userDetail.newRole),
      personalIdFile: personalIdFile
        ? await sharp(personalIdFile).toFormat("png").toBuffer()
        : null,
      storefrontFile: storefrontFile
        ? await sharp(storefrontFile).toFormat("png").toBuffer()
        : null,
      veterinarianIdFile: veterinarianIdFile
        ? await sharp(veterinarianIdFile).toFormat("png").toBuffer()
        : null,
      upgradeAt: userDetail.upgradeAt
        ? userDetail.upgradeAt.toISOString()
        : null,
      createdAt: userDetail.createdAt
        ? userDetail.createdAt.toISOString()
        : null,
      emailVerified: !!userDetail.emailVerified,
      addresses: addressesList.map((address) => ({
        id: address.id,
        name: address.name,
        address: `${address.address}, ${address.district}, ${address.city}, ${address.province}, ${address.postalCode}`,
        phoneNumber: address.phoneNumber,
        detail: address.detail,
      })),
    };

    const doc = new PDFDocument({
      font: "./public/fonts/Inter-Regular.ttf",
      size: "A4",
      margin: 36,
    });
    const chunks: Uint8Array[] = [];
    // Consolidate font registration with a loop
    const fontNames = [
      "Inter-Thin",
      "Inter-ExtraLight",
      "Inter-Light",
      "Inter-Regular",
      "Inter-Medium",
      "Inter-SemiBold",
      "Inter-Bold",
      "Inter-ExtraBold",
      "Inter-Black",
    ];
    for (const fontName of fontNames) {
      doc.registerFont(
        fontName,
        path.join(process.cwd(), `public/fonts/${fontName}.ttf`)
      );
    }

    doc.on("data", (chunk) => chunks.push(chunk));

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // PDF text helpers
      function docText(
        type: "normal" | "color",
        fontName: PDFKit.Mixins.PDFFontSource,
        fontSize: number,
        text: string,
        x?: number,
        y?: number,
        options?: PDFKit.Mixins.TextOptions & { color?: string }
      ) {
        return doc
          .font(fontName)
          .fontSize(fontSize)
          .fillColor(
            type === "color" && options?.color ? options.color : "black"
          )
          .text(text, x, y, options);
      }
      function docHeight(text: string, options?: PDFKit.Mixins.TextOptions) {
        return doc.heightOfString(text, options);
      }

      const style = { x: 36, y: 36, w: 523, p: 15, g: 12, c: "#9CA3AF" };

      const box1 = { x: style.x, y: style.y };

      const logoSCI = {
        x: box1.x + style.p,
        y: box1.y + style.p,
        w: 100,
        v: "./public/images/logo-sci.png",
      };

      if (fs.existsSync(logoSCI.v)) {
        doc.image(logoSCI.v, logoSCI.x, logoSCI.y, {
          width: logoSCI.w,
        });
      }

      const widthTextHeader = { width: 220 };
      const titleSCI = {
        x: logoSCI.x + logoSCI.w + style.g,
        y: logoSCI.y - 4,
        v: "PT. SEHAT CERAH INDONESIA",
      };

      docText(
        "normal",
        "Inter-Bold",
        14,
        titleSCI.v,
        titleSCI.x,
        titleSCI.y,
        widthTextHeader
      );

      const hTitleSCI = docHeight(titleSCI.v, widthTextHeader);

      const addressSCI = {
        x: titleSCI.x,
        y: titleSCI.y + hTitleSCI + 5,
        v: "Jl. RS . Fatmawati No. 39 Komp. Duta Mas Fatmawati Blok A1 No. 30-32 Jakarta 12150 - Indonesia.",
      };

      docText(
        "normal",
        "Inter-Regular",
        8,
        addressSCI.v,
        addressSCI.x,
        addressSCI.y,
        {
          lineGap: 2,
          ...widthTextHeader,
        }
      );

      const hAddressSCI = docHeight(addressSCI.v, {
        lineGap: 2,
        ...widthTextHeader,
      });

      const contactSCI = {
        x: addressSCI.x,
        y: addressSCI.y + hAddressSCI + 2,
        v: "Phone: (021) 722 83 83  Fax: (021) 723 77 78",
      };

      docText(
        "normal",
        "Inter-Regular",
        8,
        contactSCI.v,
        contactSCI.x,
        contactSCI.y,
        widthTextHeader
      );

      const hContactSCI = docHeight(contactSCI.v, widthTextHeader);

      const wRightHeader = { width: 150 };
      const formId = {
        x: addressSCI.x + style.g + widthTextHeader.width,
        y: titleSCI.y,
        v: "Formulir Aplikasi Pelanggan",
      };

      docText("normal", "Inter-Bold", 11, formId.v, formId.x, formId.y, {
        underline: true,
        ...wRightHeader,
      });

      const hFormId = docHeight(formId.v);

      const formEn = {
        x: formId.x,
        y: titleSCI.y + hFormId,
        v: "Customer Application Form",
      };

      docText(
        "normal",
        "Inter-Bold",
        11,
        formEn.v,
        formEn.x,
        formEn.y,
        wRightHeader
      );

      const customerName = {
        x: formId.x,
        y: contactSCI.y + hContactSCI,
        v: detailFormatted.name,
      };

      docText(
        "normal",
        "Inter-Bold",
        14,
        customerName.v,
        customerName.x,
        customerName.y,
        { underline: true, ...wRightHeader }
      );

      const hCustomerName = docHeight(customerName.v, {
        underline: true,
        ...wRightHeader,
      });

      const customerRole = {
        x: formId.x,
        y: customerName.y + hCustomerName + 2,
        v: detailFormatted.role ?? "-",
      };

      docText(
        "normal",
        "Inter-SemiBold",
        11,
        customerRole.v,
        customerRole.x,
        customerRole.y,
        wRightHeader
      );

      const hCustomerRole = docHeight(customerRole.v, wRightHeader);

      const hBox1 = customerRole.y + hCustomerRole - style.y + style.p;

      doc
        .roundedRect(box1.x, box1.y, style.w, hBox1, 8)
        .strokeColor("#9CA3AF")
        .lineWidth(1)
        .stroke();

      const box2 = {
        x: style.x,
        y: box1.y + hBox1 + style.p,
      };

      const xMain = box2.x + style.p;

      const title1 = {
        x: xMain,
        y: box2.y + style.p - 4,
        v: "I. Main Information",
      };

      docText("normal", "Inter-SemiBold", 12, title1.v, title1.x, title1.y);

      const hTitle1 = docHeight(title1.v);

      const separator1 = {
        x: { from: box2.x, to: style.w + box2.x },
        y: title1.y + hTitle1 - 4 + style.p,
      };

      doc
        .lineWidth(1)
        .strokeColor("#9CA3AF")
        .moveTo(separator1.x.from, separator1.y)
        .lineTo(separator1.x.to, separator1.y)
        .stroke();

      const wGrid3 = { width: (1 / 3) * (style.w - style.p * 2 - style.g * 2) };
      const xMainContent = [
        xMain,
        xMain + wGrid3.width + style.p,
        xMain + wGrid3.width * 2 + style.p * 2,
      ];

      const docLabelMain = (
        text: string,
        x?: number,
        y?: number,
        w?: { width: number }
      ) =>
        docText("color", "Inter-Regular", 9, text, x, y, {
          color: "#6b7280",
          ...w,
        });

      const docValueMain = (
        text: string,
        x?: number,
        y?: number,
        w?: { width: number }
      ) => docText("normal", "Inter-Medium", 10, text, x, y, w);

      const renderLabelsAndValues = (
        labels: { x: number; y: number; v: string }[],
        values: { x: number; y: number; v: string }[],
        width?: { width: number }
      ) => {
        const labelHeights = labels.map((label) => {
          docLabelMain(label.v, label.x, label.y);
          return docHeight(label.v, width);
        });
        const maxLabelHeight = Math.max(...labelHeights);

        const valueHeights = values.map((value) => {
          docValueMain(value.v, value.x, value.y);
          return docHeight(value.v, width);
        });
        const maxValueHeight = Math.max(...valueHeights);

        return { maxLabelHeight, maxValueHeight };
      };

      // Cache heights for repeated docHeight calls
      const ylabelMainFirst = separator1.y + style.p;
      const labelMainFirst = [
        { x: xMainContent[0], y: ylabelMainFirst, v: "Email" },
        { x: xMainContent[1], y: ylabelMainFirst, v: "Role" },
        { x: xMainContent[2], y: ylabelMainFirst, v: "Previous Role" },
      ];
      const labelMainFirstHeights = labelMainFirst.map((l) =>
        docHeight(l.v, wGrid3)
      );
      const maxLabelMainFirstHeight = Math.max(...labelMainFirstHeights);
      const yValueMainFirst = ylabelMainFirst + maxLabelMainFirstHeight + 2;
      const valueMainFirst = [
        {
          x: xMainContent[0],
          y: yValueMainFirst,
          v: detailFormatted.email ?? "-",
        },
        {
          x: xMainContent[1],
          y: yValueMainFirst,
          v: detailFormatted.newRole ?? "-",
        },
        {
          x: xMainContent[2],
          y: yValueMainFirst,
          v: detailFormatted.role ?? "-",
        },
      ];
      const valueMainFirstHeights = valueMainFirst.map((v) =>
        docHeight(v.v, wGrid3)
      );
      const hValueMainFirstMax = Math.max(...valueMainFirstHeights);
      renderLabelsAndValues(labelMainFirst, valueMainFirst, wGrid3);

      const ylabelMainSecond = yValueMainFirst + hValueMainFirstMax + style.g;
      const labelMainSecond = [
        { x: xMainContent[0], y: ylabelMainSecond, v: "Phone" },
        { x: xMainContent[1], y: ylabelMainSecond, v: "Joined at" },
        { x: xMainContent[2], y: ylabelMainSecond, v: "Last Upgrade Role" },
      ];
      const labelMainSecondHeights = labelMainSecond.map((l) =>
        docHeight(l.v, wGrid3)
      );
      const maxLabelMainSecondHeight = Math.max(...labelMainSecondHeights);
      const yValueMainSecond = ylabelMainSecond + maxLabelMainSecondHeight + 2;
      const valueMainSecond = [
        {
          x: xMainContent[0],
          y: yValueMainSecond,
          v: detailFormatted.phoneNumber.split(" ").join(""),
        },
        {
          x: xMainContent[1],
          y: yValueMainSecond,
          v:
            formattedDateServer(detailFormatted.createdAt, "PPP 'at' HH:mm") ??
            "-",
        },
        {
          x: xMainContent[2],
          y: yValueMainSecond,
          v:
            formattedDateServer(detailFormatted.upgradeAt, "PPP 'at' HH:mm") ??
            "-",
        },
      ];
      const valueMainSecondHeights = valueMainSecond.map((v) =>
        docHeight(v.v, wGrid3)
      );
      const hValueMainSecondMax = Math.max(...valueMainSecondHeights);
      renderLabelsAndValues(labelMainSecond, valueMainSecond, wGrid3);

      const hBox2 =
        hValueMainSecondMax +
        yValueMainSecond -
        style.y -
        hBox1 -
        style.g +
        style.p;

      doc
        .roundedRect(box2.x, box2.y, style.w, hBox2, 8)
        .strokeColor("#9CA3AF")
        .lineWidth(1)
        .stroke();

      const box3 = {
        x: style.x,
        y: box2.y + hBox2 + style.p,
      };

      const title2 = {
        x: xMain,
        y: box3.y + style.p - 4,
        v: "II. Additional Information",
      };

      docText("normal", "Inter-SemiBold", 12, title2.v, title2.x, title2.y);

      const hTitle2 = docHeight(title2.v);

      const separator2 = {
        x: { from: box3.x, to: style.w + box3.x },
        y: title2.y + hTitle2 - 4 + style.p,
      };

      doc
        .lineWidth(1)
        .strokeColor("#9CA3AF")
        .moveTo(separator2.x.from, separator2.y)
        .lineTo(separator2.x.to, separator2.y)
        .stroke();

      const wGrid2 = { width: (1 / 2) * (style.w - style.p * 2 - style.g * 2) };
      const xMainContent2 = [xMain, xMain + wGrid2.width + style.p];

      const hIdCard = wGrid2.width * (67 / 107);

      const documentTitle = {
        x: xMain,
        y: separator2.y + style.p - 4,
        v: "Document Upgrading",
      };

      const { width: wIconIdCard, height: hIconIdCard } = drawLucideIcon(
        doc,
        "id-card",
        documentTitle.x,
        documentTitle.y,
        16,
        "black",
        1.5
      );

      docText(
        "normal",
        "Inter-SemiBold",
        12,
        documentTitle.v,
        documentTitle.x + wIconIdCard + style.g - 4,
        documentTitle.y + 0.5
      );

      const hDocumentTitle = docHeight(documentTitle.v);
      const hDocumentTitleMax = Math.max(hDocumentTitle, hIconIdCard);

      const labelPersonalId = {
        x: xMainContent2[0],
        y: documentTitle.y + hDocumentTitleMax + style.g,
        v: detailFormatted.personalIdType ?? "-",
      };

      docText(
        "normal",
        "Inter-SemiBold",
        10,
        labelPersonalId.v,
        labelPersonalId.x,
        labelPersonalId.y
      );

      const hLabelPersonalId = docHeight(labelPersonalId.v);

      const docPersonalId = {
        x: xMainContent2[0],
        y: labelPersonalId.y + hLabelPersonalId + 5,
        v: detailFormatted.personalIdFile,
      };

      if (docPersonalId.v) {
        doc.save();
        doc
          .roundedRect(
            docPersonalId.x,
            docPersonalId.y,
            wGrid2.width,
            hIdCard,
            8
          )
          .clip();
        doc.image(docPersonalId.v, docPersonalId.x, docPersonalId.y, wGrid2);
        doc.restore();
      }

      const labelOther = {
        x: xMainContent2[1],
        y: documentTitle.y + hDocumentTitleMax + style.g,
        v:
          userDetail.newRole === "PETSHOP"
            ? "Pet Shop Buildings"
            : userDetail.newRole === "VETERINARIAN"
              ? "KTA"
              : "-",
      };

      docText(
        "normal",
        "Inter-SemiBold",
        10,
        labelOther.v,
        labelOther.x,
        labelOther.y
      );

      const hLabelOther = docHeight(labelOther.v);

      const docOther = {
        x: xMainContent2[1],
        y: labelOther.y + hLabelOther + 5,
        v:
          userDetail.newRole === "PETSHOP"
            ? detailFormatted.storefrontFile
            : userDetail.newRole === "VETERINARIAN"
              ? detailFormatted.veterinarianIdFile
              : null,
      };

      if (docOther.v) {
        doc.save();
        doc
          .roundedRect(docOther.x, docOther.y, wGrid2.width, hIdCard, 8)
          .clip();
        doc.image(docOther.v, docOther.x, docOther.y, wGrid2);
        doc.restore();
      }

      const yLabelFullName = docPersonalId.y + hIdCard + style.g;
      const labelFullName = [
        {
          x: docPersonalId.x,
          y: yLabelFullName,
          v: "Full Name",
        },
      ];
      const labelFullNameHeights = labelFullName.map((l) =>
        docHeight(l.v, wGrid3)
      );
      const maxLabelFullNameHeight = Math.max(...labelFullNameHeights);
      const yValueFullName = yLabelFullName + maxLabelFullNameHeight + 2;

      const valueFullName = [
        {
          x: docPersonalId.x,
          y: yValueFullName,
          v: detailFormatted.fullName ?? "-",
        },
      ];

      const { maxValueHeight: hFullName } = renderLabelsAndValues(
        labelFullName,
        valueFullName
      );

      const yLabelUpgrading = yValueFullName + hFullName + style.g;
      const labelUpgrading = [
        {
          x: xMainContent2[0],
          y: yLabelUpgrading,
          v:
            detailFormatted.personalIdType === "KTP"
              ? "NIK Number"
              : (detailFormatted.personalIdType ?? "-"),
        },
      ];
      const labelUpgradingVet = [
        ...labelUpgrading,
        {
          x: xMainContent2[1],
          y: yLabelUpgrading,
          v: "KTA Number",
        },
      ];
      const labelUpgradingHeights = (
        userDetail.newRole === "VETERINARIAN"
          ? labelUpgradingVet
          : labelUpgrading
      ).map((l) => docHeight(l.v, wGrid3));
      const maxLabelUpgradingHeight = Math.max(...labelUpgradingHeights);
      const yValueUpgrading = yLabelUpgrading + maxLabelUpgradingHeight + 2;

      const valueUpgrading = [
        {
          x: xMainContent2[0],
          y: yValueUpgrading,
          v: detailFormatted.personalId ?? "-",
        },
      ];
      const valueUpgradingVet = [
        ...valueUpgrading,
        {
          x: xMainContent2[1],
          y: yValueUpgrading,
          v: detailFormatted.veterinarianId ?? "-",
        },
      ];

      const { maxValueHeight: hUpgrading } = renderLabelsAndValues(
        userDetail.newRole === "VETERINARIAN"
          ? labelUpgradingVet
          : labelUpgrading,
        userDetail.newRole === "VETERINARIAN"
          ? valueUpgradingVet
          : valueUpgrading,
        wGrid2
      );

      const separator3 = {
        x: { from: box3.x, to: style.w + box3.x },
        y: hUpgrading + yValueUpgrading - 4 + style.p,
      };

      doc
        .lineWidth(1)
        .strokeColor("#9CA3AF")
        .moveTo(separator3.x.from, separator3.y)
        .lineTo(separator3.x.to, separator3.y)
        .stroke();

      const roleDoc = {
        x: docPersonalId.x + 6,
        y: separator3.y + style.p - 2,
        v: detailFormatted.newRole ?? "-",
      };

      docText("normal", "Inter-Regular", 8, roleDoc.v, roleDoc.x, roleDoc.y);

      const hRole = docHeight(roleDoc.v);
      const wRole = doc.widthOfString(roleDoc.v);

      doc
        .roundedRect(roleDoc.x - 6, roleDoc.y - 2, wRole + 12, hRole + 4, 8)
        .strokeColor("#9CA3AF")
        .lineWidth(1)
        .stroke();

      const approveTime = {
        x: box3.x,
        y: separator3.y + style.p,
        v:
          detailFormatted.status === "PENDING"
            ? "Waiting for approval"
            : `${detailFormatted.status === "APPROVED" ? "Approved at" : ""}${detailFormatted.status === "REJECTED" ? "Rejected at" : ""} ${formattedDateServer(detailFormatted.upgradeAt, "PPP 'at' HH:mm")}`,
      };

      docText(
        "normal",
        "Inter-Regular",
        8,
        approveTime.v,
        approveTime.x,
        approveTime.y,
        { align: "right", width: style.w - style.p }
      );

      const hBox3 =
        hUpgrading + yValueUpgrading - box2.y - hBox2 - style.g + style.p + 30;

      doc
        .roundedRect(box3.x, box3.y, style.w, hBox3, 8)
        .strokeColor("#9CA3AF")
        .lineWidth(1)
        .stroke();

      doc.save();

      // --- Before box4: check if we need a new page for List Address section
      let nextY = box3.y + hBox3 + style.p;
      if (nextY > doc.page.height - 150) {
        doc.addPage();
        nextY = style.y;
      }
      const box4 = {
        x: style.x,
        y: nextY,
      };

      const listAddress = {
        x: xMain,
        y: box4.y + style.p - 4,
        v: "List Address",
      };

      const { width: wIconMapPinned, height: hIconMapPinned } = drawLucideIcon(
        doc,
        "map-pinned",
        listAddress.x,
        listAddress.y,
        16,
        "black",
        1.5
      );

      docText(
        "normal",
        "Inter-SemiBold",
        12,
        listAddress.v,
        listAddress.x + wIconMapPinned + style.g - 4,
        listAddress.y + 0.5
      );

      const hListAddress = docHeight(listAddress.v);
      const hListAddressMax = Math.max(hListAddress, hIconMapPinned);

      const separator4 = {
        x: { from: box4.x, to: style.w + box4.x },
        y: listAddress.y + hListAddressMax - 4 + style.p,
      };

      doc
        .lineWidth(1)
        .strokeColor("#9CA3AF")
        .moveTo(separator4.x.from, separator4.y)
        .lineTo(separator4.x.to, separator4.y)
        .stroke();

      // --- Refactored List Address (box4) section for multi-page support ---
      // Track start Y per page for box4
      let yCursor = separator4.y + style.p;
      let pageStartY = box4.y;
      // Defensive: If no address, just draw box4 and exit
      if (detailFormatted.addresses.length === 0) {
        const hBox4 = separator4.y + style.p + 20 - box4.y;
        doc
          .roundedRect(box4.x, box4.y, style.w, hBox4, 8)
          .strokeColor("#9CA3AF")
          .lineWidth(1)
          .stroke();
      } else {
        // For each address, render the address block, and page break if needed
        let isFirstOnPage = true;
        for (let i = 0; i < detailFormatted.addresses.length; i++) {
          const addr = detailFormatted.addresses[i];
          // Draw icons and text, measure heights
          const iconY = i === 0 ? yCursor : yCursor - style.p;
          const { width: wIconMap, height: hIconMap } = drawLucideIcon(
            doc,
            "map",
            listAddress.x,
            iconY,
            14,
            "black",
            1.5
          );
          const { width: wIconChevronRight, height: hIconChevronRight } =
            drawLucideIcon(
              doc,
              "chevron-right",
              listAddress.x + wIconMap + style.g - 6,
              iconY,
              14,
              "black",
              1.5
            );
          // Name
          docText(
            "normal",
            "Inter-SemiBold",
            10,
            addr.name,
            listAddress.x + wIconMap + wIconChevronRight + (style.g - 6) * 2,
            iconY
          );
          const hName = docHeight(addr.name);
          docText(
            "normal",
            "Inter-Regular",
            10,
            addr.phoneNumber,
            box4.x,
            iconY,
            { width: style.w - style.p, align: "right" }
          );
          const hPhone = docHeight(addr.phoneNumber);
          const hNameMax = Math.max(hIconMap, hIconChevronRight, hName, hPhone);
          // Address Detail label
          const labelAD = {
            x: listAddress.x,
            y: iconY + hNameMax + style.g,
            v: "Address Detail",
          };
          docText("color", "Inter-Regular", 9, labelAD.v, labelAD.x, labelAD.y);
          const hLabelAD = docHeight(labelAD.v);
          // Address Detail value
          const valueAD = {
            x: labelAD.x,
            y: labelAD.y + hLabelAD + 2,
            v: addr.detail,
          };
          docText(
            "normal",
            "Inter-Medium",
            10,
            valueAD.v,
            valueAD.x,
            valueAD.y
          );
          const hValueAD = docHeight(valueAD.v);
          // Address label
          const labelA = {
            x: listAddress.x,
            y: valueAD.y + hValueAD + style.g,
            v: "Address",
          };
          docText("color", "Inter-Regular", 9, labelA.v, labelA.x, labelA.y);
          const hLabelA = docHeight(labelA.v);
          // Address value
          const valueA = {
            x: labelA.x,
            y: labelA.y + hLabelA + 2,
            v: addr.address,
          };
          docText("normal", "Inter-Medium", 10, valueA.v, valueA.x, valueA.y);
          const hValueA = docHeight(valueA.v);
          // Separator for address item
          const separatorAI = {
            x: { from: box4.x + style.p, to: style.w + box4.x - style.p },
            y: valueA.y + hValueA - 4 + style.p,
          };
          // Calculate the total height this address block will take (including spacing after separator)
          const addressBlockEndY = separatorAI.y + style.p + 20;
          // Look ahead: does the next address fit on this page? (if not last)
          let willOverflow = false;
          if (i < detailFormatted.addresses.length - 1) {
            // Estimate next address block height (using current as proxy)
            const estimatedNextBlockHeight = addressBlockEndY - yCursor;
            if (
              addressBlockEndY + estimatedNextBlockHeight + 20 >
              doc.page.height - 36
            ) {
              willOverflow = true;
            }
          }
          // Draw separator line unless last address on last page
          const isLastItem = i === detailFormatted.addresses.length - 1;
          if (!isLastItem && !willOverflow) {
            doc
              .lineWidth(1)
              .strokeColor("#9CA3AF")
              .moveTo(separatorAI.x.from, separatorAI.y)
              .lineTo(separatorAI.x.to, separatorAI.y)
              .stroke();
          }
          // If next address will overflow, draw box border up to this address, then addPage, reset pageStartY, and header
          if (willOverflow) {
            // Draw box border up to last address block on this page
            const hBox4Page = addressBlockEndY - pageStartY - style.g - style.p;
            doc
              .roundedRect(box4.x, pageStartY, style.w, hBox4Page, 8)
              .strokeColor("#9CA3AF")
              .lineWidth(1)
              .stroke();
            doc.restore();
            doc.addPage();
            doc.save();
            // Reset pageStartY and yCursor for new page
            pageStartY = style.y;
            box4.x = style.x;
            box4.y = style.y;
            // Draw List Address header again on new page
            const headerY = box4.y + style.p - 4;
            drawLucideIcon(doc, "map-pinned", xMain, headerY, 16, "black", 1.5);
            docText(
              "normal",
              "Inter-SemiBold",
              12,
              "List Address",
              xMain + wIconMapPinned + style.g - 4,
              headerY + 0.5
            );
            const hListAddressAgain = docHeight("List Address");
            const hListAddressMaxAgain = Math.max(
              hListAddressAgain,
              hIconMapPinned
            );
            const separator4Again = {
              x: { from: box4.x, to: style.w + box4.x },
              y: headerY + hListAddressMaxAgain - 4 + style.p,
            };
            doc
              .lineWidth(1)
              .strokeColor("#9CA3AF")
              .moveTo(separator4Again.x.from, separator4Again.y)
              .lineTo(separator4Again.x.to, separator4Again.y)
              .stroke();
            yCursor = separator4Again.y + style.p;
            pageStartY = box4.y;
            isFirstOnPage = true;
            continue;
          }
          yCursor = addressBlockEndY;
          isFirstOnPage = false;
        }
        // Draw rounded rect for box4 on last page, using pageStartY and yCursor
        const hBox4Final = yCursor - pageStartY - style.g - style.p;
        doc
          .roundedRect(box4.x, pageStartY, style.w, hBox4Final, 8)
          .strokeColor("#9CA3AF")
          .lineWidth(1)
          .stroke();
      }

      doc.restore();

      doc.end();
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=preview.pdf",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.log(error);
    return errorRes("INTERNAL_ERROR:", 500);
  }
}

type LucideIconType = "id-card" | "map" | "map-pinned" | "chevron-right";

function drawLucideIcon(
  doc: PDFKit.PDFDocument,
  type: LucideIconType,
  x: number,
  y: number,
  size: number = 24,
  color: string = "#000000",
  lineWidth: number = 2
): { width: number; height: number } {
  doc.save();
  const scale = size / 24;

  doc.translate(x, y);
  doc.scale(scale);
  doc
    .strokeColor(color)
    .lineWidth(lineWidth)
    .lineCap("round")
    .lineJoin("round");

  switch (type) {
    // ------------------ 🪪 ID CARD ------------------
    case "id-card":
      doc.roundedRect(2, 5, 20, 14, 2).stroke();
      doc.moveTo(16, 10).lineTo(18, 10).stroke();
      doc.moveTo(16, 14).lineTo(18, 14).stroke();
      doc
        .moveTo(6.17, 15)
        .bezierCurveTo(7.17, 12.5, 10.83, 12.5, 11.83, 15)
        .stroke();
      doc.circle(9, 11, 2).stroke();
      break;

    // ------------------ 🗺️ MAP ------------------
    case "map":
      doc
        .moveTo(8.894, 3.553)
        .bezierCurveTo(9.522, 3.238, 10.282, 3.238, 10.911, 3.553)
        .lineTo(15.123, 5.659)
        .bezierCurveTo(15.858, 6.031, 16.719, 6.031, 17.454, 5.659)
        .lineTo(21.113, 3.829)
        .bezierCurveTo(21.493, 3.639, 21.921, 3.967, 21.921, 4.402)
        .lineTo(21.921, 17.166)
        .bezierCurveTo(21.921, 17.467, 21.744, 17.738, 21.468, 17.881)
        .lineTo(16.915, 20.158)
        .bezierCurveTo(16.233, 20.5, 15.436, 20.5, 14.754, 20.158)
        .lineTo(10.542, 18.052)
        .bezierCurveTo(9.807, 17.68, 8.946, 17.68, 8.211, 18.052)
        .lineTo(4.552, 19.882)
        .bezierCurveTo(4.172, 20.072, 3.744, 19.744, 3.744, 19.309)
        .lineTo(3.744, 6.546)
        .bezierCurveTo(3.744, 6.245, 3.921, 5.974, 4.197, 5.831)
        .lineTo(8.75, 3.554)
        .stroke();
      doc.moveTo(15, 5.764).lineTo(15, 20.764).stroke();
      doc.moveTo(9, 3.236).lineTo(9, 18.236).stroke();
      break;

    // ------------------ 📍 MAP PINNED ------------------
    case "map-pinned":
      doc
        .moveTo(18, 8)
        .bezierCurveTo(18, 11.613, 14.131, 15.429, 12.607, 16.795)
        .bezierCurveTo(12.215, 17.106, 11.785, 17.106, 11.393, 16.795)
        .bezierCurveTo(9.869, 15.429, 6, 11.613, 6, 8)
        .bezierCurveTo(6, 4.686, 8.686, 2, 12, 2)
        .bezierCurveTo(15.314, 2, 18, 4.686, 18, 8)
        .stroke();
      doc.circle(12, 8, 2).stroke();
      doc
        .moveTo(8.714, 14)
        .lineTo(5.004, 14)
        .bezierCurveTo(4.57, 14, 4.191, 14.283, 4.056, 14.683)
        .lineTo(2.052, 20.683)
        .bezierCurveTo(1.871, 21.227, 2.281, 21.8, 2.852, 21.8)
        .lineTo(21.148, 21.8)
        .bezierCurveTo(21.719, 21.8, 22.129, 21.227, 21.948, 20.683)
        .lineTo(19.948, 14.683)
        .bezierCurveTo(19.813, 14.283, 19.434, 14, 19, 14)
        .lineTo(15.288, 14)
        .stroke();
      break;

    // ------------------ ➡️ CHEVRON RIGHT ------------------
    case "chevron-right":
      doc.moveTo(9, 18).lineTo(15, 12).lineTo(9, 6).stroke();
      break;
  }

  doc.restore();
  return { width: size, height: size };
}
