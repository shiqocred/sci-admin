import { auth, errorRes, successRes } from "@/lib/auth";
import {
  db,
  orderItems,
  orders,
  products,
  productVariants,
  users,
} from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const [customers, productsRes] = await Promise.all([
      db
        .select({ value: users.id, label: users.name })
        .from(users)
        .innerJoin(orders, eq(users.id, orders.userId))
        .groupBy(users.id, users.name),
      db
        .selectDistinct({
          id: productVariants.id,
          productName: products.name,
          variantName: productVariants.name,
          skuVariant: productVariants.sku,
        })
        .from(productVariants)
        .leftJoin(orderItems, eq(orderItems.variantId, productVariants.id))
        .leftJoin(products, eq(products.id, productVariants.productId)),
    ]);

    const productFormatted = productsRes.map((product) => ({
      value: product.id,
      label:
        product.variantName === "default"
          ? `(${product.skuVariant}) ${product.productName}`
          : `(${product.skuVariant}) ${product.productName} - ${product.variantName}`,
    }));

    return successRes({ customers, products: productFormatted });
  } catch (error) {
    console.error("ERROR_GET_FILTER_EXPORT:", error);
    return errorRes("Internal Error", 500);
  }
}
