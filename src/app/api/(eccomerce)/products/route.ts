import { r2Public } from "@/config";
import { errorRes, successRes } from "@/lib/auth";
import {
  categories,
  db,
  productImages,
  products,
  productToPets,
  productVariants,
  suppliers,
} from "@/lib/db";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") ?? "";

    const categoryIds = req.nextUrl.searchParams
      .getAll("categoryId")
      .filter(Boolean);
    const supplierIds = req.nextUrl.searchParams
      .getAll("supplierId")
      .filter(Boolean);
    const petIds = req.nextUrl.searchParams.getAll("petId").filter(Boolean);

    const filters = [];
    if (categoryIds.length)
      filters.push(inArray(products.categoryId, categoryIds));
    if (supplierIds.length)
      filters.push(inArray(products.supplierId, supplierIds));
    filters.push(eq(products.status, true));

    filters.push(sql`
      EXISTS (
        SELECT 1
        FROM ${productVariants}
        WHERE ${productVariants.productId} = ${products.id}
          AND ${productVariants.stock} > 0
      )
    `);

    const baseWhere = filters.length ? and(...filters) : undefined;
    const petFilter = petIds.length
      ? inArray(productToPets.petId, petIds)
      : undefined;

    const finalWhere = petFilter
      ? baseWhere
        ? and(baseWhere, petFilter)
        : petFilter
      : baseWhere;

    const { where, offset, limit, pagination } = await getTotalAndPagination(
      products,
      q,
      [products.name, products.slug],
      req,
      finalWhere,
      true
    );
    const productsList = await db
      .select({
        id: products.id,
        title: products.name,
        slug: products.slug,
        description: products.description,
        image: sql`
          (SELECT ${productImages.url} 
           FROM ${productImages} 
           WHERE ${productImages.productId} = ${products.id} 
           ORDER BY ${productImages.createdAt} ASC 
           LIMIT 1)`.as("image"),
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
      .leftJoin(productToPets, eq(products.id, productToPets.productId))
      .where(where)
      .groupBy(products.id, categories.name, suppliers.name)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    const formatted = productsList.map((item) => ({
      ...item,
      image: item.image ? `${r2Public}/${item.image as string}` : null,
    }));

    return successRes({ data: formatted, pagination }, "Products list");
  } catch (error) {
    console.log("ERROR_GET_PRODUCTS", error);
    return errorRes("Internal Error", 500);
  }
}
