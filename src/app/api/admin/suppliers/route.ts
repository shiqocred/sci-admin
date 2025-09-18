import { auth, errorRes, successRes } from "@/lib/auth";
import { suppliers, db, products } from "@/lib/db";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { uploadToR2 } from "@/lib/providers";
import { createId } from "@paralleldrive/cuid2";
import { and, asc, count, desc, eq, isNull } from "drizzle-orm";
import { NextRequest } from "next/server";
import slugify from "slugify";
import { z } from "zod/v4";
import { r2Public } from "@/config";
import { convertToWebP } from "@/lib/convert-image";

const supplierSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 character" }),
  slug: z.string(),
});

const sortField = (s: string) => {
  if (s === "name") return suppliers.name;
  if (s === "slug") return suppliers.slug;
  if (s === "products") return count(products.id);
  return suppliers.createdAt;
};

export async function GET(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") ?? "";
    const sort = req.nextUrl.searchParams.get("sort") ?? "created";
    const order = req.nextUrl.searchParams.get("order") ?? "desc";

    const { where, offset, limit, pagination } = await getTotalAndPagination(
      suppliers,
      q,
      [suppliers.name, suppliers.slug],
      req
    );

    const suppliersRes = await db
      .select({
        id: suppliers.id,
        name: suppliers.name,
        slug: suppliers.slug,
        image: suppliers.image,
        totalProducts: count(products.id).as("totalProducts"),
      })
      .from(suppliers)
      .leftJoin(
        products,
        and(eq(products.supplierId, suppliers.id), isNull(products.deletedAt))
      )
      .where(where)
      .groupBy(suppliers.id)
      .orderBy(order === "desc" ? desc(sortField(sort)) : asc(sortField(sort)))
      .limit(limit)
      .offset(offset);

    const suppliersResFormated = suppliersRes.map((item) => ({
      ...item,
      image: item.image ? `${r2Public}/${item.image}` : null,
    }));

    return successRes(
      { data: suppliersResFormated, pagination },
      "Suppliers list"
    );
  } catch (error) {
    console.log("ERROR_GET_SUPPLIERS", error);
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

    const result = supplierSchema.safeParse({ name: nameBody, slug: slugBody });

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
      const webpBuffer = await convertToWebP(image);
      const key = `images/suppliers/${createId()}-${slugify(name, { lower: true })}.webp`;

      const r2Up = await uploadToR2({ buffer: webpBuffer, key });

      if (!r2Up) return errorRes("Upload Failed", 400, r2Up);

      const [supplier] = await db
        .insert(suppliers)
        .values({
          name,
          slug,
          image: key,
        })
        .returning({
          id: suppliers.id,
          name: suppliers.name,
          slug: suppliers.slug,
          image: suppliers.image,
        });

      const supplierWithImageUrl = {
        ...supplier,
        image: supplier.image ? `${r2Public}/${supplier.image}` : null,
      };

      return successRes(supplierWithImageUrl, "Supplier successfully created");
    }

    const [supplier] = await db
      .insert(suppliers)
      .values({
        name,
        slug,
      })
      .returning({
        id: suppliers.id,
        name: suppliers.name,
        slug: suppliers.slug,
      });

    return successRes(supplier, "Supplier Successfully created");
  } catch (error) {
    console.log("ERROR_CREATE_CATEGORY:", error);
    return errorRes("Internal Error", 500);
  }
}
