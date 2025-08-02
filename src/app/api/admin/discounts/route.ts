import { auth, errorRes, successRes } from "@/lib/auth";
import {
  db,
  discountCategories,
  discountPets,
  discountProductVariants,
  discounts,
  discountSuppliers,
  discountToRoles,
  discountUsers,
} from "@/lib/db";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { asc, count, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

interface ItemProps {
  id: string;
  code: string;
  applyType: "products" | "categories" | "suppliers" | "pets";
  valueType: "fixed" | "percentage";
  value: string;
  startAt: Date;
  endAt: Date | null;
  categories: number;
  suppliers: number;
  pets: number;
  users: number;
  role: number;
  eligibilityType: "user" | "role" | null;
  productsVariant: number;
  isActive: boolean | null;
}

const discountSchema = z.object({
  code: z.string().min(1, { message: "Title or Voucher is required" }),
  valueType: z.enum(["percentage", "fixed"], {
    message:
      "Type value is unavailable, valid type value 'percentage' or 'fixed'",
  }),
  value: z
    .string()
    .min(1, { message: "Value Percentage or Fixed is required" }),
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
  startDiscount: z
    .string()
    .transform((val) => new Date(val))
    .refine((val) => !isNaN(val.getTime()), { message: "Invalid date" }),
  endDiscount: z
    .string()
    .transform((val) => new Date(val))
    .refine((val) => !isNaN(val.getTime()), { message: "Invalid date" })
    .nullish(),
});

const sortField = (s: string) => {
  if (s === "voucher") return discounts.code;
  return discounts.createdAt;
};

export async function GET(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") ?? "";
    const sort = req.nextUrl.searchParams.get("sort") ?? "created";
    const order = req.nextUrl.searchParams.get("order") ?? "desc";

    const { where, offset, limit, pagination } = await getTotalAndPagination(
      discounts,
      q,
      [discounts.code],
      req
    );

    const discountsRes = await db
      .select({
        id: discounts.id,
        code: discounts.code,
        applyType: discounts.apply,
        valueType: discounts.valueType,
        value: discounts.value,
        startAt: discounts.startAt,
        endAt: discounts.endAt,
        isActive: discounts.isActive,
        eligibilityType: discounts.eligibilityType,
        categories: count(discountCategories.discountId),
        suppliers: count(discountSuppliers.discountId),
        pets: count(discountPets.discountId),
        productsVariant: count(discountProductVariants.discountId),
        users: count(discountUsers.discountId),
        role: count(discountToRoles.discountId),
      })
      .from(discounts)
      .leftJoin(
        discountCategories,
        eq(discountCategories.discountId, discounts.id)
      )
      .leftJoin(
        discountSuppliers,
        eq(discountSuppliers.discountId, discounts.id)
      )
      .leftJoin(discountPets, eq(discountPets.discountId, discounts.id))
      .leftJoin(
        discountProductVariants,
        eq(discountProductVariants.discountId, discounts.id)
      )
      .leftJoin(discountUsers, eq(discountUsers.discountId, discounts.id))
      .leftJoin(discountToRoles, eq(discountToRoles.discountId, discounts.id))
      .where(where)
      .groupBy(discounts.id)
      .orderBy(order === "desc" ? desc(sortField(sort)) : asc(sortField(sort)))
      .limit(limit)
      .offset(offset);

    const applyFormatted = (item: ItemProps) => {
      if (item.applyType === "categories") return item.categories;
      if (item.applyType === "suppliers") return item.suppliers;
      if (item.applyType === "pets") return item.pets;
      return item.productsVariant;
    };

    const statusFormat = (item: ItemProps) => {
      const { isActive, startAt, endAt } = item;
      const now = Date.now();
      const start = new Date(startAt).getTime();
      const end = endAt ? new Date(endAt).getTime() : null;

      if (isActive === true) return "active";
      if (isActive === false) return "expired";

      if (now < start) return "scheduled";
      if (end === null || now <= end) return "active";
      return "expired";
    };

    const EligibilityFormat = (item: ItemProps) => {
      if (item.eligibilityType === "user") return item.users;
      if (item.eligibilityType === "role") return item.role;
      return null;
    };

    const response = discountsRes.map((item) => ({
      id: item.id,
      code: item.code,
      applyType: item.applyType,
      valueType: item.valueType,
      value: item.value,
      eligibilityType: item.eligibilityType,
      eligibility: EligibilityFormat(item),
      totalApply: applyFormatted(item),
      status: statusFormat(item),
    }));

    return successRes({ data: response, pagination }, "Discounts list");
  } catch (error) {
    console.log("ERROR_GET_DISCOUNTS", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const body = await req.json();
    const result = discountSchema.safeParse(body);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return errorRes("Validation failed", 400, errors);
    }

    const {
      apply,
      applyType,
      eligibility,
      eligibilityType,
      limitOnce,
      limitUse,
      minimum,
      minimumType,
      code,
      startDiscount,
      endDiscount,
      value,
      valueType,
    } = result.data;

    // 1. Create main discount record
    const [newDiscount] = await db
      .insert(discounts)
      .values({
        code,
        valueType,
        value,
        apply: applyType,
        minimumType: minimumType !== "nothing" ? minimumType : null,
        eligibilityType: eligibilityType !== "all" ? eligibilityType : null,
        minimum: minimum ?? null,
        maxTotalUse: limitUse ?? null,
        maxUserOnce: limitOnce,
        startAt: new Date(startDiscount),
        endAt: endDiscount ? new Date(endDiscount) : null,
      })
      .returning();

    const discountId = newDiscount.id;

    // 2. Insert applyTo mapping
    const applyMap = {
      categories: discountCategories,
      suppliers: discountSuppliers,
      pets: discountPets,
      products: discountProductVariants,
    };

    const applyTable = applyMap[applyType];
    const keyMap = {
      products: "variantId",
      categories: "categoryId",
      suppliers: "supplierId",
      pets: "petId",
      users: "userId",
      roles: "role", // khusus enum
    };
    if (applyTable) {
      await db.insert(applyTable).values(
        apply.map((id) => ({
          discountId,
          [keyMap[applyType]]: id,
        }))
      );
    }

    if (eligibility) {
      if (eligibilityType === "role") {
        await db.insert(discountToRoles).values(
          eligibility.map((role) => ({
            discountId,
            role: role as "BASIC" | "PETSHOP" | "VETERINARIAN",
          }))
        );
      } else if (eligibilityType === "user") {
        await db
          .insert(discountUsers)
          .values(eligibility.map((userId) => ({ discountId, userId })));
      }
    }

    return successRes({ id: discountId }, "Discount successfully created");
  } catch (error) {
    console.error("ERROR_CREATE_DISCOUNT:", error);
    return errorRes("Internal Error", 500);
  }
}
