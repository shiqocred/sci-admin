import { auth, errorRes, successRes } from "@/lib/auth";
import { db, products, productVariants, suppliers } from "@/lib/db";
import { eq, isNull } from "drizzle-orm";

export async function GET() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const [supplierRes, productsRes] = await Promise.all([
      db.select({ value: suppliers.id, label: suppliers.name }).from(suppliers),
      db
        .selectDistinct({
          id: productVariants.id,
          productName: products.name,
          variantName: productVariants.name,
          skuVariant: productVariants.sku,
        })
        .from(productVariants)
        .leftJoin(products, eq(products.id, productVariants.productId))
        .where(isNull(products.deletedAt)),
      ,
    ]);

    const productFormatted = productsRes.map((product) => ({
      value: product.id,
      label:
        product.variantName === "default"
          ? `(${product.skuVariant}) ${product.productName}`
          : `(${product.skuVariant}) ${product.productName} - ${product.variantName}`,
    }));

    return successRes({ suppliers: supplierRes, products: productFormatted });
  } catch (error) {
    console.error("ERROR_GET_CUSTOMER_FILTER_EXPORT:", error);
    return errorRes("Internal Error", 500);
  }
}
