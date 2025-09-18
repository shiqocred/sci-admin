import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { convertToWebP } from "@/lib/convert-image";
import { bannerItems, banners, db, products } from "@/lib/db";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { uploadToR2 } from "@/lib/providers";
import { pronoun } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";
import { and, asc, countDistinct, desc, eq, isNull, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

type BannerType = "DETAIL" | "PETS" | "SUPPLIERS" | "PROMOS" | "CATEGORIES";

const sortFieldMap: Record<string, any> = {
  name: banners.name,
  type: banners.type,
  created: banners.createdAt,
};

function statusFormat(item: any) {
  const now = Date.now();
  const start = new Date(item.startAt).getTime();
  const end = item.endAt ? new Date(item.endAt).getTime() : null;

  if (end && end < start) return "expired";
  if (now < start) return "scheduled";
  if (!end || now <= end) return "active";

  return "expired";
}
function applyFormatted(item: any) {
  const typeMap: Record<string, string> = {
    PETS: "Pet",
    PRODUCTS: "Product",
    PROMOS: "Promo",
    SUPPLIERS: "Supplier",
    CATEGORIES: "Categor",
  };

  if (typeMap[item.type]) {
    let suffix;

    if (item.type === "CATEGORIES") {
      suffix = item.totalMount > 1 ? "ies" : "y";
    } else {
      suffix = pronoun(item.totalMount);
    }

    return `${item.totalMount.toLocaleString()} ${typeMap[item.type]}${suffix}`;
  }

  return `Detail ${item.detail}`;
}

export async function GET(req: NextRequest) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") ?? "";
    const sort = req.nextUrl.searchParams.get("sort") ?? "created";
    const order = req.nextUrl.searchParams.get("order") ?? "desc";

    const { where, offset, limit, pagination } = await getTotalAndPagination(
      banners,
      q,
      [banners.name],
      req
    );

    const bannersRes = await db
      .select({
        id: banners.id,
        name: banners.name,
        image: banners.image,
        type: banners.type,
        startAt: banners.startAt,
        endAt: banners.endAt,
        totalMount: countDistinct(bannerItems.id).as("totalMount"),
        detail: sql`MIN(${products.name})`.as("detail"), // ambil nama pertama
      })
      .from(banners)
      .leftJoin(bannerItems, eq(bannerItems.bannerId, banners.id))
      .leftJoin(
        products,
        and(eq(products.id, bannerItems.productId), isNull(products.deletedAt))
      )
      .where(where)
      .groupBy(banners.id)
      .orderBy(
        order === "desc" ? desc(sortFieldMap[sort]) : asc(sortFieldMap[sort])
      )
      .limit(limit)
      .offset(offset);

    const bannersResFormated = bannersRes.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image ? `${r2Public}/${item.image}` : null,
      status: statusFormat(item),
      apply: applyFormatted(item),
    }));

    return successRes({ data: bannersResFormated, pagination }, "Banner list");
  } catch (error) {
    console.error("ERROR_GET_BANNERS", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const body = await req.formData();
    const name = body.get("name") as string;
    const type = body.get("type") as BannerType;
    const apply = body.getAll("apply") as string[];
    const image = body.get("image") as File | null;

    if (!image) return errorRes("Image is required", 400);

    const start = body.get("start_banner") as string;
    const end = body.get("end_banner") as string | null;

    const bannerId = createId();
    const key = `images/banners/${bannerId}-${Date.now()}.webp`;

    await uploadToR2({
      buffer: await convertToWebP(image),
      key,
    });

    await db.insert(banners).values({
      id: bannerId,
      name,
      image: key,
      startAt: new Date(start),
      endAt: end ? new Date(end) : null,
      type,
    });

    const bannerData = apply.map((id) => ({
      bannerId,
      productId: ["PRODUCTS", "DETAIL"].includes(type) ? id : null,
      petId: type === "PETS" ? id : null,
      supplierId: type === "SUPPLIERS" ? id : null,
      promoId: type === "PROMOS" ? id : null,
      categoryId: type === "CATEGORIES" ? id : null,
    }));

    await db.insert(bannerItems).values(bannerData);

    return successRes({ id: bannerId }, "Banner successfully created");
  } catch (error) {
    console.error("ERROR_CREATE_BANNER:", error);
    return errorRes("Internal Error", 500);
  }
}
