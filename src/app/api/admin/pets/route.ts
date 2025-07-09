import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { pets, db, products, productToPets } from "@/lib/db";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { uploadToR2 } from "@/lib/providers";
import { createId } from "@paralleldrive/cuid2";
import { asc, count, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import sharp from "sharp";
import slugify from "slugify";
import { z } from "zod/v4";

const petSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 character" }),
  slug: z.string(),
});

const sortField = (s: string) => {
  if (s === "name") return pets.name;
  if (s === "slug") return pets.slug;
  if (s === "products") return count(products.id);
  return pets.createdAt;
};

export async function GET(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") ?? "";
    const sort = req.nextUrl.searchParams.get("sort") ?? "created";
    const order = req.nextUrl.searchParams.get("order") ?? "desc";

    const { where, offset, limit, pagination } = await getTotalAndPagination(
      pets,
      q,
      [pets.name, pets.slug],
      req
    );

    const petsRes = await db
      .select({
        id: pets.id,
        name: pets.name,
        slug: pets.slug,
        image: pets.image,
        totalProducts: count(products.id).as("totalProducts"),
      })
      .from(pets)
      .leftJoin(productToPets, eq(productToPets.petId, pets.id))
      .leftJoin(products, eq(products.id, productToPets.productId))
      .where(where)
      .groupBy(pets.id)
      .orderBy(order === "desc" ? desc(sortField(sort)) : asc(sortField(sort)))
      .limit(limit)
      .offset(offset);

    const petsResFormated = petsRes.map((item) => ({
      ...item,
      image: item.image ? `${r2Public}/${item.image}` : null,
    }));

    return successRes({ data: petsResFormated, pagination }, "Pet list");
  } catch (error) {
    console.log("ERROR_GET_PETS", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const body = await req.formData();
    const nameBody = body.get("name") as string;
    const slugBody = body.get("slug") as string;
    const image = body.get("image") as File | null;

    const result = petSchema.safeParse({ name: nameBody, slug: slugBody });

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      return errorRes("Validation failed", 400, errors);
    }

    const { name, slug } = result.data;

    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const webpBuffer = await sharp(buffer).webp({ quality: 50 }).toBuffer();
      const key = `images/pets/${createId()}-${slugify(name, { lower: true })}.webp`;

      const r2Up = await uploadToR2({ buffer: webpBuffer, key });

      if (!r2Up) return errorRes("Upload Failed", 400, r2Up);

      const [pet] = await db
        .insert(pets)
        .values({
          name,
          slug,
          image: key,
        })
        .returning({
          id: pets.id,
          name: pets.name,
          slug: pets.slug,
          image: pets.image,
        });

      const petWithImageUrl = {
        ...pet,
        image: pet.image ? `${r2Public}/${pet.image}` : null,
      };

      return successRes(petWithImageUrl, "Pet successfully created");
    }

    const [pet] = await db
      .insert(pets)
      .values({
        name,
        slug,
      })
      .returning({ name: pets.name, slug: pets.slug });

    return successRes(pet, "Pet successfully created");
  } catch (error) {
    console.log("ERROR_CREATE_PET:", error);
    return errorRes("Internal Error", 500);
  }
}
