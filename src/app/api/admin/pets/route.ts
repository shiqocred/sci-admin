import { auth, errorRes, successRes } from "@/lib/auth";
import { pets, db, products, productToPets } from "@/lib/db";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { asc, count, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
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

    return successRes({ data: petsRes, pagination }, "Pet list");
  } catch (error) {
    console.log("ERROR_GET_PETS", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

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
