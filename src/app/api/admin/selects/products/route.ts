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
        normalPrice: productVariants.normalPrice,
        basicPrice: productVariants.basicPrice,
        petShopPrice: productVariants.petShopPrice,
        doctorPrice: productVariants.doctorPrice,
      })
      .from(products)
      .leftJoin(productVariants, eq(products.id, productVariants.productId));

    const result = transformRawToProducts(raw);
    return successRes(result, "Selects list");
  } catch (error) {
    console.error("ERROR_GET_SELECTS", error);
    return errorRes("Internal Error", 500);
  }
}

type RawProduct = {
  productId: string;
  productName: string;
  variantId: string | null;
  variantName: string | null;
  isDefault: boolean | null;
  stock: string | null;
  normalPrice: string | null;
  basicPrice: string | null;
  petShopPrice: string | null;
  doctorPrice: string | null;
};

// ✅ Ekstrak logic untuk kurangi CC
function transformRawToProducts(raw: RawProduct[]): any[] {
  const productMap = new Map<string, any>();

  for (const item of raw) {
    if (!productMap.has(item.productId)) {
      productMap.set(item.productId, {
        id: item.productId,
        name: item.productName,
        default_variant: null,
        variants: [],
      });
    }

    if (!item.variantId) continue;

    const variant = {
      id: item.variantId,
      name: item.variantName,
      stock: Number(item.stock),
      normalPrice: Number(item.normalPrice),
      basicPrice: Number(item.basicPrice),
      petShopPrice: Number(item.petShopPrice),
      doctorPrice: Number(item.doctorPrice),
    };

    const product = productMap.get(item.productId);
    if (item.isDefault) {
      product.default_variant = variant;
    } else {
      product.variants.push(variant);
    }
  }

  return Array.from(productMap.values()).map((product) => {
    const hasNoVariants = product.variants.length === 0;
    const shouldSetNull =
      (product.default_variant && hasNoVariants) ||
      (!product.default_variant && hasNoVariants);

    return {
      ...product,
      variants: shouldSetNull ? null : product.variants,
    };
  });
}
