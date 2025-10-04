import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { convertToWebP } from "@/lib/convert-image";
import { bannerItems, banners, db } from "@/lib/db";
import { deleteR2, uploadToR2 } from "@/lib/providers";
import { and, eq, notInArray } from "drizzle-orm";
import { NextRequest } from "next/server";

type BannerType = "DETAIL" | "PETS" | "SUPPLIERS" | "PROMOS" | "CATEGORIES";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bannerId: string }> }
) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const { bannerId } = await params;

    const [bannerRes, bannerItemsRes] = await Promise.all([
      db.query.banners.findFirst({
        where: (b, { eq }) => eq(b.id, bannerId),
      }),
      db.query.bannerItems.findMany({
        where: (bi, { eq }) => eq(bi.bannerId, bannerId),
      }),
    ]);

    if (!bannerRes || bannerItemsRes.length < 1)
      return errorRes("Banner not found.", 404);

    const formatSelected = (
      type:
        | "PRODUCTS"
        | "DETAIL"
        | "PETS"
        | "SUPPLIERS"
        | "PROMOS"
        | "CATEGORIES"
    ) => {
      if (type === "CATEGORIES")
        return bannerItemsRes.map((i) => i.categoryId) as string[];
      if (type === "PETS")
        return bannerItemsRes.map((i) => i.petId) as string[];
      if (type === "SUPPLIERS")
        return bannerItemsRes.map((i) => i.supplierId) as string[];
      if (type === "PROMOS")
        return bannerItemsRes.map((i) => i.promoId) as string[];
      return bannerItemsRes.map((i) => i.productId) as string[];
    };

    const statusFormat = () => {
      const { startAt, endAt } = bannerRes;
      const now = Date.now();
      const start = new Date(startAt).getTime();
      const end = endAt ? new Date(endAt).getTime() : null;

      if (end && end < start) return "expired";
      if (now < start) return "scheduled";
      if (!end || now <= end) return "active";

      return "expired";
    };

    const response = {
      name: bannerRes.name,
      imageOld: `${r2Public}/${bannerRes.image}`,
      apply: bannerRes.type.toLowerCase(),
      selected: formatSelected(bannerRes.type),
      startAt: bannerRes.startAt.toISOString(),
      endAt: bannerRes.endAt ? bannerRes.endAt.toISOString() : undefined,
      isEnd: !!bannerRes.endAt,
      status: statusFormat(),
    };

    return successRes(response, "Retrieve banner");
  } catch (error) {
    console.error("ERROR_GET_BANNERS", error);
    return errorRes("Internal Error", 500);
  }
}

function getBannerItemIdSelector(type: BannerType) {
  const selectorMap: Record<
    BannerType,
    (bi: typeof bannerItems.$inferSelect) => string | null
  > = {
    PETS: (bi) => bi.petId,
    SUPPLIERS: (bi) => bi.supplierId,
    PROMOS: (bi) => bi.promoId,
    CATEGORIES: (bi) => bi.categoryId,
    DETAIL: (bi) => bi.productId,
  };
  return selectorMap[type] ?? selectorMap.DETAIL;
}

function getBannerItemColumn(type: BannerType) {
  const columnMap: Record<BannerType, any> = {
    PETS: bannerItems.petId,
    SUPPLIERS: bannerItems.supplierId,
    PROMOS: bannerItems.promoId,
    CATEGORIES: bannerItems.categoryId,
    DETAIL: bannerItems.productId,
  };
  return columnMap[type] ?? columnMap.DETAIL;
}

function mapBannerItem(type: BannerType, bannerId: string, id: string) {
  return {
    bannerId,
    productId: ["PRODUCTS", "DETAIL"].includes(type) ? id : null,
    petId: type === "PETS" ? id : null,
    supplierId: type === "SUPPLIERS" ? id : null,
    promoId: type === "PROMOS" ? id : null,
    categoryId: type === "CATEGORIES" ? id : null,
  };
}

async function uploadBannerImage(
  imageOld: string,
  image: File | null,
  bannerId: string
) {
  if (!image) return undefined;
  const imageKey = `images/banners/${bannerId}-${Date.now()}`;
  await Promise.all([
    deleteR2(imageOld),
    uploadToR2({
      buffer: await convertToWebP(image),
      key: imageKey,
    }),
  ]);
  return imageKey;
}

async function syncBannerItems(
  type: BannerType,
  bannerId: string,
  apply: string[]
) {
  const existing = await db.query.bannerItems.findMany({
    where: (bi, { eq }) => eq(bi.bannerId, bannerId),
  });

  const idSelector = getBannerItemIdSelector(type);
  const column = getBannerItemColumn(type);
  const existingIds = new Set(existing.map(idSelector));

  // Hapus yang tidak di-apply
  await db
    .delete(bannerItems)
    .where(and(eq(bannerItems.bannerId, bannerId), notInArray(column, apply)));

  // Insert yang belum ada
  const newData = apply
    .filter((id) => !existingIds.has(id))
    .map((id) => mapBannerItem(type, bannerId, id));

  if (newData.length) {
    await db.insert(bannerItems).values(newData);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ bannerId: string }> }
) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);
    const { bannerId } = await params;

    const existingBanner = await db.query.banners.findFirst({
      columns: { type: true, image: true },
      where: (b, { eq }) => eq(b.id, bannerId),
    });
    if (!existingBanner) throw errorRes("Banner not found", 404);

    const body = await req.formData();
    const name = body.get("name") as string;
    const type = body.get("type") as BannerType;
    const apply = body.getAll("apply") as string[];
    const image = body.get("image") as File | null;

    const start = body.get("start_banner") as string;
    const end = body.get("end_banner") as string | null;

    const imageKey = await uploadBannerImage(
      existingBanner.image,
      image,
      bannerId
    );

    await db
      .update(banners)
      .set({
        name,
        type,
        startAt: new Date(start),
        endAt: end ? new Date(end) : null,
        ...(imageKey && { image: imageKey }),
      })
      .where(eq(banners.id, bannerId));

    if (existingBanner.type !== type) {
      await db.delete(bannerItems).where(eq(bannerItems.bannerId, bannerId));
      if (apply.length) {
        await db
          .insert(bannerItems)
          .values(apply.map((id) => mapBannerItem(type, bannerId, id)));
      }
    } else {
      await syncBannerItems(type, bannerId, apply);
    }

    return successRes({ id: bannerId }, "Banner successfully updated");
  } catch (error) {
    console.error("ERROR_UPDATE_BANNER:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ bannerId: string }> }
) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);
    const { bannerId } = await params;

    const banner = await db
      .delete(banners)
      .where(eq(banners.id, bannerId))
      .returning();

    if (!banner) return errorRes("Selected banner not found", 404);

    return successRes(null, "Banner successfully updated");
  } catch (error) {
    console.error("ERROR_UPDATE_BANNER:", error);
    return errorRes("Internal Error", 500);
  }
}
