import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { convertToWebP } from "@/lib/convert-image";
import { db, promoItems, promos } from "@/lib/db";
import { deleteR2, uploadToR2 } from "@/lib/providers";
import { generateRandomNumber } from "@/lib/utils";
import { format } from "date-fns";
import { and, eq, inArray } from "drizzle-orm";
import { NextRequest } from "next/server";
import slugify from "slugify";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ promoId: string }> }
) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const { promoId } = await params;

    const [promoRes, promoItemsRes] = await Promise.all([
      db.query.promos.findFirst({
        where: (b, { eq }) => eq(b.id, promoId),
      }),
      db.query.promoItems.findMany({
        where: (bi, { eq }) => eq(bi.promoId, promoId),
      }),
    ]);

    if (!promoRes || promoItemsRes.length < 1)
      return errorRes("Promo not found.", 404);

    const statusFormat = () => {
      const { startAt, endAt } = promoRes;
      const now = Date.now();
      const start = new Date(startAt).getTime();
      const end = endAt ? new Date(endAt).getTime() : null;

      if (end && end < start) return "expired";
      if (now < start) return "scheduled";
      if (!end || now <= end) return "active";

      return "expired";
    };

    const response = {
      name: promoRes.name,
      imageOld: `${r2Public}/${promoRes.image}`,
      selected: promoItemsRes.map((product) => product.productId),
      startDate: promoRes.startAt.toString(),
      startTime: format(promoRes.startAt, "HH:mm"),
      endDate: promoRes.endAt ? promoRes.endAt.toString() : undefined,
      endTime: promoRes.endAt ? format(promoRes.endAt, "HH:mm") : undefined,
      isEnd: !!promoRes.endAt,
      status: statusFormat(),
    };

    return successRes(response, "Retrieve promo");
  } catch (error) {
    console.error("ERROR_GET_PROMOS", error);
    return errorRes("Internal Error", 500);
  }
}

async function uploadPromoImage(
  imageOld: string,
  image: File | null,
  promoId: string
) {
  if (!image) return undefined;
  const imageKey = `images/promos/${promoId}-${Date.now()}`;
  await Promise.all([
    deleteR2(imageOld),
    uploadToR2({
      buffer: await convertToWebP(image),
      key: imageKey,
    }),
  ]);
  return imageKey;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ promoId: string }> }
) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);
    const { promoId } = await params;

    const [existingPromo, existingPromoItems] = await Promise.all([
      db.query.promos.findFirst({
        columns: { image: true, slug: true, name: true },
        where: (p, { eq }) => eq(p.id, promoId),
      }),
      db.query.promoItems.findMany({
        columns: { productId: true },
        where: (pi, { eq }) => eq(pi.promoId, promoId),
      }),
    ]);

    if (!existingPromo || existingPromoItems.length === 0)
      throw errorRes("Promo not found", 404);

    const body = await req.formData();
    const name = body.get("name") as string;
    const apply = body.getAll("apply") as string[];
    const image = body.get("image") as File | null;

    const start = body.get("start_promo") as string;
    const end = body.get("end_promo") as string | null;

    const newSlug = async () => {
      if (existingPromo.name === name) return existingPromo.slug;
      const slug = `${slugify(name, { lower: true })}-${generateRandomNumber()}`;

      return slug;
    };

    const imageKey = await uploadPromoImage(
      existingPromo.image,
      image,
      promoId
    );

    const productIds = existingPromoItems.map((pi) => pi.productId);

    const newItems = apply.filter((a) => !productIds.includes(a));
    const deletedItems = productIds.filter((p) => !apply.includes(p));

    await db.transaction(async (tx) => {
      await tx
        .update(promos)
        .set({
          name,
          slug: await newSlug(),
          startAt: new Date(start),
          endAt: end ? new Date(end) : null,
          ...(imageKey && { image: imageKey }),
        })
        .where(eq(promos.id, promoId));

      if (deletedItems.length > 0)
        await tx
          .delete(promoItems)
          .where(
            and(
              inArray(promoItems.productId, deletedItems),
              eq(promoItems.promoId, promoId)
            )
          );
      if (newItems.length > 0)
        await tx
          .insert(promoItems)
          .values(newItems.map((productId) => ({ promoId, productId })));
    });

    return successRes({ id: promoId }, "Promo successfully updated");
  } catch (error) {
    console.error("ERROR_UPDATE_PROMO:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ promoId: string }> }
) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);
    const { promoId } = await params;

    await db.transaction(async (tx) => {
      const promo = await tx.delete(promos).where(eq(promos.id, promoId));

      if (!promo) return errorRes("Selected promo not found", 404);

      await tx.delete(promoItems).where(eq(promoItems.promoId, promoId));
    });

    return successRes(null, "Promo successfully updated");
  } catch (error) {
    console.error("ERROR_UPDATE_PROMO:", error);
    return errorRes("Internal Error", 500);
  }
}
