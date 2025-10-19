import { auth, errorRes, successRes } from "@/lib/auth";
import {
  db,
  freeShippings,
  freeShippingApplies,
  freeShippingEligibilities,
} from "@/lib/db";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { pronoun } from "@/lib/utils";
import { asc, count, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const freeShippingSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  applyType: z.enum(["categories", "suppliers", "pets", "products"], {
    message:
      "Type apply is unavailable, valid type value 'categories' or 'suppliers' or 'pets' or 'product'",
  }),
  apply: z
    .array(z.string().min(1, { message: "Selected apply is required" }))
    .min(1, { message: "Selected apply is required" }),
  eligibilityType: z.enum(["role", "user", "all"], {
    message:
      "Type eligibility is unavailable, valid type value 'role' or 'user' or 'all'",
  }),
  eligibility: z
    .array(z.string().min(1, { message: "Selected eligibility is required" }))
    .min(1, { message: "Selected eligibility is required" })
    .nullish(),
  minimumType: z.enum(["nothing", "quantity", "amount"], {
    message:
      "Type minimum is unavailable, valid type value 'nothing' or 'quantity' or 'amount'",
  }),
  minimum: z
    .string()
    .min(1, { message: "Selected minimum is required" })
    .nullish(),
  limitUse: z
    .string()
    .min(1, { message: "Limit use total is required" })
    .nullish(),
  limitOnce: z.boolean(),
  startFreeShipping: z
    .string()
    .transform((val) => new Date(val))
    .refine((val) => !isNaN(val.getTime()), { message: "Invalid date" }),
  endFreeShipping: z
    .string()
    .transform((val) => new Date(val))
    .refine((val) => !isNaN(val.getTime()), { message: "Invalid date" })
    .nullish(),
});

const sortField = (s: string) => {
  if (s === "name") return freeShippings.name;
  return freeShippings.createdAt;
};

export async function GET(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") ?? "";
    const sort = req.nextUrl.searchParams.get("sort") ?? "created";
    const order = req.nextUrl.searchParams.get("order") ?? "desc";

    const { where, offset, limit, pagination } = await getTotalAndPagination(
      freeShippings,
      q,
      [freeShippings.name],
      req
    );

    const freeShippingRes = await db
      .select({
        id: freeShippings.id,
        name: freeShippings.name,
        applyType: freeShippings.apply,
        startAt: freeShippings.startAt,
        endAt: freeShippings.endAt,
        eligibilityType: freeShippings.eligibilityType,
        categories: count(freeShippingApplies.freeShippingId),
        suppliers: count(freeShippingApplies.freeShippingId),
        pets: count(freeShippingApplies.freeShippingId),
        productsVariant: count(freeShippingApplies.freeShippingId),
      })
      .from(freeShippings)
      .leftJoin(
        freeShippingApplies,
        eq(freeShippingApplies.freeShippingId, freeShippings.id)
      )
      .leftJoin(
        freeShippingEligibilities,
        eq(freeShippingEligibilities.freeShippingId, freeShippings.id)
      )
      .where(where)
      .groupBy(freeShippings.id)
      .orderBy(order === "desc" ? desc(sortField(sort)) : asc(sortField(sort)))
      .limit(limit)
      .offset(offset);

    const freeShippingEligibilityRes =
      await db.query.freeShippingEligibilities.findMany();

    const response = freeShippingRes.map((item) => {
      const applyFormatted = (() => {
        if (item.applyType === "categories")
          return `${item.categories} Categorie${pronoun(item.categories)}`;
        if (item.applyType === "suppliers")
          return `${item.suppliers} Supplier${pronoun(item.suppliers)}`;
        if (item.applyType === "pets")
          return `${item.pets} Pet${pronoun(item.pets)}`;
        return `${item.productsVariant} Product${pronoun(item.productsVariant)}`;
      })();

      const statusFormat = (() => {
        const now = Date.now();
        const start = new Date(item.startAt).getTime();
        const end = item.endAt ? new Date(item.endAt).getTime() : null;

        if (end && end < start) return "expired";
        if (now < start) return "scheduled";
        if (!end || now <= end) return "active";

        return "expired";
      })();

      const EligibilityFormat = (() => {
        if (item.eligibilityType === "user") {
          const filtered = freeShippingEligibilityRes.filter(
            (c) => c.freeShippingId === item.id
          );
          return `${filtered.length} User${pronoun(filtered.length)}`;
        }
        if (item.eligibilityType === "role") {
          const filtered = freeShippingEligibilityRes.filter(
            (c) => c.freeShippingId === item.id
          );
          return filtered.length === 3
            ? "All Customers"
            : filtered
                .map(
                  (i) =>
                    (i.role === "BASIC" && "Role Agent") ||
                    (i.role === "PETSHOP" && "Role Pet Shop") ||
                    (i.role === "VETERINARIAN" && "Role Vet Clinic")
                )
                .join(" & ");
        }
        return "All Customers";
      })();

      return {
        id: item.id,
        name: item.name,
        eligibility: EligibilityFormat,
        apply: applyFormatted,
        status: statusFormat,
      };
    });

    return successRes({ data: response, pagination }, "Free shippings list");
  } catch (error) {
    console.error("ERROR_GET_FREE_SHIPPINGS:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const body = await req.json();
    const result = freeShippingSchema.safeParse(body);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return errorRes("Validation failed", 400, errors);
    }

    const {
      apply: applyData,
      applyType: applyTypeData,
      eligibility: eligibilityData,
      eligibilityType: eligibilityTypeData,
      limitOnce: limitOnceData,
      limitUse: limitUseData,
      minimum: minimumData,
      minimumType: minimumTypeData,
      name: nameData,
      startFreeShipping: startFreeShippingData,
      endFreeShipping: endFreeShippingData,
    } = result.data;

    const freeShippingExits = await db.query.freeShippings.findMany({
      columns: { name: true },
    });

    if (
      freeShippingExits.filter(
        (i) => i.name.toLowerCase() === nameData.toLowerCase()
      ).length > 0
    )
      return errorRes("Validation failed", 400, {
        name: `Name ${nameData} already exits`,
      });

    const fieldMap = {
      products: "variantId",
      categories: "categoryId",
      suppliers: "supplierId",
      pets: "petId",
    } as const;

    // 1. Create main free shipping record
    const [newShipping] = await db
      .insert(freeShippings)
      .values({
        name: nameData,
        apply: applyTypeData,
        minimumType: minimumTypeData !== "nothing" ? minimumTypeData : null,
        eligibilityType:
          eligibilityTypeData !== "all" ? eligibilityTypeData : null,
        minimum: minimumData ?? null,
        maxTotalUse: limitUseData ?? null,
        maxUserOnce: limitOnceData,
        startAt: new Date(startFreeShippingData),
        endAt: endFreeShippingData ? new Date(endFreeShippingData) : null,
      })
      .returning();

    const freeShippingId = newShipping.id;

    await db.insert(freeShippingApplies).values(
      applyData.map((id) => ({
        freeShippingId,
        [fieldMap[applyTypeData]]: id,
      }))
    );

    if (eligibilityData) {
      await db.insert(freeShippingEligibilities).values(
        eligibilityData.map((item) => ({
          freeShippingId,
          role:
            eligibilityTypeData === "role"
              ? (item as "BASIC" | "PETSHOP" | "VETERINARIAN")
              : null,
          userId: eligibilityTypeData === "user" ? item : null,
        }))
      );
    }

    return successRes(
      { id: freeShippingId },
      "Free Shipping successfully created"
    );
  } catch (error) {
    console.error("ERROR_CREATE_FREE_SHIPPING:", error);
    return errorRes("Internal Error", 500);
  }
}
