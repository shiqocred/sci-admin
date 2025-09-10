import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { convertToWebP } from "@/lib/convert-image";
import { db, promoItems, promos } from "@/lib/db";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { uploadToR2 } from "@/lib/providers";
import { generateRandomNumber, pronoun } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";
import { asc, countDistinct, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import slugify from "slugify";

const sortFieldMap: Record<string, any> = {
  name: promos.name,
  created: promos.createdAt,
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

export async function GET(req: NextRequest) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") ?? "";
    const sort = req.nextUrl.searchParams.get("sort") ?? "created";
    const order = req.nextUrl.searchParams.get("order") ?? "desc";

    const { where, offset, limit, pagination } = await getTotalAndPagination(
      promos,
      q,
      [promos.name],
      req
    );

    const promosRes = await db
      .select({
        id: promos.id,
        name: promos.name,
        image: promos.image,
        startAt: promos.startAt,
        endAt: promos.endAt,
        totalMount: countDistinct(promoItems.productId).as("totalMount"),
      })
      .from(promos)
      .leftJoin(promoItems, eq(promoItems.promoId, promos.id))
      .where(where)
      .groupBy(promos.id)
      .orderBy(
        order === "desc" ? desc(sortFieldMap[sort]) : asc(sortFieldMap[sort])
      )
      .limit(limit)
      .offset(offset);

    const promosResFormated = promosRes.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image ? `${r2Public}/${item.image}` : null,
      status: statusFormat(item),
      totalMount: `${item.totalMount} Product${pronoun(item.totalMount)}`,
    }));

    return successRes({ data: promosResFormated, pagination }, "Promos list");
  } catch (error) {
    console.error("ERROR_GET_PROMOS", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const body = await req.formData();
    const name = body.get("name") as string;
    const apply = body.getAll("apply") as string[];
    const image = body.get("image") as File | null;

    if (!image) return errorRes("Image is required", 400);

    const start = body.get("start_promo") as string;
    const end = body.get("end_promo") as string | null;

    const slug = `${slugify(name, { lower: true })}-${generateRandomNumber()}`;

    const promoId = createId();
    const key = `images/promos/${promoId}-${Date.now()}`;

    await uploadToR2({
      buffer: await convertToWebP(image),
      key,
    });

    await db.insert(promos).values({
      id: promoId,
      name,
      image: key,
      startAt: new Date(start),
      endAt: end ? new Date(end) : null,
      slug,
    });

    const promoData = apply.map((productId) => ({
      promoId,
      productId,
    }));

    await db.insert(promoItems).values(promoData);

    return successRes({ id: promoId }, "Promo successfully created");
  } catch (error) {
    console.error("ERROR_CREATE_PROMO:", error);
    return errorRes("Internal Error", 500);
  }
}
