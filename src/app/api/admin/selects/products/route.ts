import { auth, errorRes, successRes } from "@/lib/auth";
import { db, products, productVariants } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const raw = await db
      .select({
        productId: products.id,
        productName: products.name,
        variantId: productVariants.id,
        variantName: productVariants.name,
        isDefault: productVariants.isDefault,
        stock: productVariants.stock,
        price: productVariants.price,
      })
      .from(products)
      .leftJoin(productVariants, eq(products.id, productVariants.productId));

    const variantIds = raw.map((i) => i.variantId) as string[];

    const pricing = await db.query.productVariantPrices.findMany({
      where: (pp, { inArray }) => inArray(pp.variantId, variantIds),
    });

    const result = transformProductData(raw, pricing);
    return successRes(result, "Selects list");
  } catch (error) {
    console.error("ERROR_GET_SELECTS", error);
    return errorRes("Internal Error", 500);
  }
}

type Pricing = {
  role: string;
  price: string;
};

type Variant = {
  id: string;
  name: string;
  stock: string;
  price: string;
  pricing: Pricing[];
};

type ProductTransformed = {
  id: string;
  name: string;
  variants: Variant[] | null;
  defaultVariant: Variant | null;
};

function transformProductData(
  productVariants: any[],
  pricing: any[]
): ProductTransformed[] {
  // Grup productVariants berdasarkan productId
  const grouped: Record<string, any[]> = {};
  productVariants.forEach((pv) => {
    if (!grouped[pv.productId]) grouped[pv.productId] = [];
    grouped[pv.productId].push(pv);
  });

  // Map ke bentuk ProductTransformed
  const result: ProductTransformed[] = Object.entries(grouped).map(
    ([productId, variants]) => {
      const defaultVar = variants.find((v) => v.isDefault) || null;
      const nonDefaultVars = variants.filter((v) => !v.isDefault);

      const mapVariant = (v: any): Variant => ({
        id: v.variantId,
        name: v.variantName,
        stock: v.stock,
        price: v.price,
        pricing: pricing
          .filter((p) => p.variantId === v.variantId)
          .map((p) => ({ role: p.role, price: p.price })),
      });

      return {
        id: productId,
        name: variants[0].productName,
        variants:
          nonDefaultVars.length > 0 ? nonDefaultVars.map(mapVariant) : null,
        defaultVariant: defaultVar ? mapVariant(defaultVar) : null,
      };
    }
  );

  return result;
}
