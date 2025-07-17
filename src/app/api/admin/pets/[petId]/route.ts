import { auth, errorRes, successRes } from "@/lib/auth";
import { pets, db, productToPets } from "@/lib/db";
import { deleteR2, uploadToR2 } from "@/lib/providers";
import { count, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";
import { createId } from "@paralleldrive/cuid2";
import slugify from "slugify";
import { r2Public } from "@/config";
import { convertToWebP } from "@/lib/convert-image";

const petSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 character" }),
  slug: z.string(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ petId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { petId } = await params;

    if (!petId) return errorRes("Pet id is required", 400);

    const petRes = await db.query.pets.findFirst({
      columns: {
        id: true,
        name: true,
        slug: true,
        image: true,
      },
      where: (c, { eq }) => eq(c.id, petId),
    });

    if (!petRes) return errorRes("Supplier not found", 404);

    const supplierWithImageUrl = {
      ...petRes,
      image: petRes.image ? `${r2Public}/${petRes.image}` : null,
    };

    return successRes(supplierWithImageUrl, "Pet detail");
  } catch (error) {
    console.log("ERROR_SHOW_PET:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ petId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { petId } = await params;

    if (!petId) return errorRes("pet id is required", 400);

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

    const existPet = await db.query.pets.findFirst({
      columns: {
        image: true,
      },
      where: (c, { eq }) => eq(c.id, petId),
    });

    if (!existPet) return errorRes("Pet not found.", 404);

    if (image) {
      if (existPet.image) await deleteR2(existPet.image);

      const webpBuffer = await convertToWebP(image);
      const key = `images/pets/${createId()}-${slugify(name, { lower: true })}.webp`;

      const r2Up = await uploadToR2({ buffer: webpBuffer, key });

      if (!r2Up) return errorRes("Upload Failed", 400, r2Up);

      const [pet] = await db
        .update(pets)
        .set({ name, slug, image: key, updatedAt: sql`NOW()` })
        .where(eq(pets.id, petId))
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

      return successRes(petWithImageUrl, "pet successfully created");
    }

    const [pet] = await db
      .update(pets)
      .set({
        name,
        slug,
        image: existPet.image,
        updatedAt: sql`NOW()`,
      })
      .where(eq(pets.id, petId))
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

    return successRes(petWithImageUrl, "pet successfully updated");
  } catch (error) {
    console.log("ERROR_UPDATE_PET:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ petId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { petId } = await params;

    if (!petId) return errorRes("Pet id is required", 400);

    const productMount = await db
      .select({ count: count() })
      .from(productToPets)
      .where(eq(productToPets.petId, petId));

    const totalProductMount = productMount[0].count;

    if (totalProductMount > 0)
      return errorRes("Pet is in use and cannot be deleted.", 400);

    const petRes = await db.query.pets.findFirst({
      where: eq(pets.id, petId),
      columns: {
        id: true,
        image: true,
      },
    });

    if (!petRes) return errorRes("Pet not found", 404);

    await db.delete(pets).where(eq(pets.id, petId));

    if (petRes.image) await deleteR2(petRes.image);

    return successRes(null, "Pet successfully deleted");
  } catch (error) {
    console.log("ERROR_DELETE_PET:", error);
    return errorRes("Internal Error", 500);
  }
}
