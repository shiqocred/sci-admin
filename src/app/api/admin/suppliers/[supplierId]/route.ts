import { r2bucket, r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { suppliers, db, products } from "@/lib/db";
import { r2 } from "@/lib/providers";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { count, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import slugify from "slugify";
import sharp from "sharp";
import { z } from "zod/v4";

const supplierSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 character" }),
  slug: z.string(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { supplierId } = await params;

    if (!supplierId) return errorRes("Supplier id is required", 400);

    const supplierRes = await db.query.suppliers.findFirst({
      columns: {
        id: true,
        name: true,
        slug: true,
        image: true,
      },
      where: (c, { eq }) => eq(c.id, supplierId),
    });

    if (!supplierRes) return errorRes("Supplier not found", 404);

    const supplierWithImageUrl = {
      ...supplierRes,
      image: supplierRes.image
        ? `https://s3.sro.my.id/${supplierRes.image}`
        : null,
    };

    return successRes(supplierWithImageUrl, "Supplier detail");
  } catch (error) {
    console.log("ERROR_SHOW_SUPPLIER:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { supplierId } = await params;

    if (!supplierId) return errorRes("Supplier id is required", 400);

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

    const existSupplier = await db.query.suppliers.findFirst({
      columns: {
        image: true,
      },
      where: (c, { eq }) => eq(c.id, supplierId),
    });

    if (!existSupplier) return errorRes("Supplier not found.", 404);

    if (image) {
      if (existSupplier.image) {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: r2bucket,
            Key: existSupplier.image,
          })
        );
      }

      const buffer = Buffer.from(await image.arrayBuffer());
      const webpBuffer = await sharp(buffer).webp({ quality: 50 }).toBuffer();
      const key = `images/${createId()}-${slugify(name, { lower: true })}.webp`;

      const r2Up = await r2.send(
        new PutObjectCommand({
          Bucket: r2bucket,
          Key: key,
          Body: webpBuffer,
          ContentType: "image/webp",
        })
      );

      if (!r2Up) return errorRes("Upload Failed", 400, r2Up);

      const [supplier] = await db
        .update(suppliers)
        .set({ name, slug, image: key, updatedAt: sql`NOW()` })
        .where(eq(suppliers.id, supplierId))
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
      .update(suppliers)
      .set({
        name,
        slug,
        image: null,
        updatedAt: sql`NOW()`,
      })
      .where(eq(suppliers.id, supplierId))
      .returning({
        id: suppliers.id,
        name: suppliers.name,
        slug: suppliers.slug,
        image: suppliers.image,
      });

    return successRes(supplier, "Supplier successfully updated");
  } catch (error) {
    console.log("ERROR_UPDATE_SUPPLIER:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { supplierId } = await params;

    if (!supplierId) return errorRes("Supplier id is required", 400);

    const productMount = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.supplierId, supplierId));

    const totalProductMount = productMount[0].count;

    if (totalProductMount > 0)
      return errorRes("Supplier is in use and cannot be deleted.", 400);

    // 2. Ambil data supplier
    const supplier = await db.query.suppliers.findFirst({
      where: eq(suppliers.id, supplierId),
      columns: {
        id: true,
        image: true, // hanya ambil kolom yang dibutuhkan
      },
    });

    if (!supplier) return errorRes("Supplier not found", 404);

    await db.delete(suppliers).where(eq(suppliers.id, supplierId));

    if (supplier.image) {
      await r2.send(
        new DeleteObjectCommand({
          Bucket: r2bucket,
          Key: supplier.image,
        })
      );
    }

    return successRes(null, "Supplier successfully deleted");
  } catch (error) {
    console.log("ERROR_DELETE_SUPPLIER:", error);
    return errorRes("Internal Error", 500);
  }
}
