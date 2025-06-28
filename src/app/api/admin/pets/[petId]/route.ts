import { auth, errorRes, successRes } from "@/lib/auth";
import { pets, db, products } from "@/lib/db";
import { count, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";
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
      },
      where: (c, { eq }) => eq(c.id, petId),
    });

    return successRes(petRes, "Pet detail");
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

    if (!petId) return errorRes("Pet id is required", 400);

    const body = await req.json();
    const result = petSchema.safeParse(body);
    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      return errorRes("Validation failed", 400, errors);
    }

    const { name, slug } = result.data;

    const [pet] = await db
      .update(pets)
      .set({
        name,
        slug,
        updatedAt: sql`NOW()`,
      })
      .where(eq(pets.id, petId))
      .returning({
        id: pets.id,
        name: pets.name,
        slug: pets.slug,
      });

    return successRes(pet, "Pet successfully updated");
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
      .from(products)
      .where(eq(products.petId, petId));

    const totalProductMount = productMount[0].count;

    if (totalProductMount > 0)
      return errorRes("Pet is in use and cannot be deleted.", 400);

    const petRes = await db.delete(pets).where(eq(pets.id, petId));

    if (!petRes) return errorRes("Pet not found", 404);

    return successRes(null, "Pet successfully deleted");
  } catch (error) {
    console.log("ERROR_DELETE_PET:", error);
    return errorRes("Internal Error", 500);
  }
}
