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
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

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
    .min(1, { message: "Selected eligibility is required" }),
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ discountId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { discountId } = await params;

    if (!discountId) return errorRes("discount id is required", 400);

    const discountRes = await db.query.discounts.findFirst({
      where: (d, { eq }) => eq(d.id, discountId),
    });

    if (!discountRes) return errorRes("discount not found", 404);

    let apply: string[] = [];

    if (discountRes.apply === "categories") {
      const categoryRes = await db.query.discountCategories.findMany({
        columns: {
          categoryId: true,
        },
        where: (d, { eq }) => eq(d.discountId, discountId),
      });

      apply = categoryRes.map((i) => i.categoryId);
    } else if (discountRes.apply === "suppliers") {
      const supplierRes = await db.query.discountSuppliers.findMany({
        columns: {
          supplierId: true,
        },
        where: (d, { eq }) => eq(d.discountId, discountId),
      });

      apply = supplierRes.map((i) => i.supplierId);
    } else if (discountRes.apply === "pets") {
      const petRes = await db.query.discountPets.findMany({
        columns: {
          petId: true,
        },
        where: (d, { eq }) => eq(d.discountId, discountId),
      });

      apply = petRes.map((i) => i.petId);
    } else if (discountRes.apply === "products") {
      const productRes = await db.query.discountProductVariants.findMany({
        columns: {
          variantId: true,
        },
        where: (d, { eq }) => eq(d.discountId, discountId),
      });

      apply = productRes.map((i) => i.variantId);
    }

    let eligibility: string[] = [];

    if (discountRes.eligibilityType === "role") {
      const roleRes = await db.query.discountToRoles.findMany({
        columns: {
          role: true,
        },
        where: (d, { eq }) => eq(d.discountId, discountId),
      });

      eligibility = roleRes.map((i) => i.role);
    } else if (discountRes.eligibilityType === "user") {
      const userRes = await db.query.discountUsers.findMany({
        columns: {
          userId: true,
        },
        where: (d, { eq }) => eq(d.discountId, discountId),
      });

      eligibility = userRes.map((i) => i.userId);
    }

    const statusFormat = () => {
      const { isActive, startAt, endAt } = discountRes;
      const now = Date.now();
      const start = new Date(startAt).getTime();
      const end = endAt ? new Date(endAt).getTime() : null;

      if (isActive === true) return "active";
      if (isActive === false) return "expired";

      if (now < start) return "scheduled";
      if (end === null || now <= end) return "active";
      return "expired";
    };

    const response = {
      apply,
      applyType: discountRes.apply,
      eligibility,
      eligibilityType: discountRes.eligibilityType,
      limitOnce: discountRes.maxUserOnce,
      limitUse: discountRes.maxTotalUse,
      minimum: discountRes.minimum,
      minimumType: discountRes.minimumType,
      code: discountRes.code,
      startDiscount: discountRes.startAt,
      endDiscount: discountRes.endAt,
      value: discountRes.value,
      valueType: discountRes.valueType,
      status: statusFormat(),
    };

    return successRes(response, "Discount detail");
  } catch (error) {
    console.log("ERROR_SHOW_DISCOUNT:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ discountId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { discountId } = await params;
    if (!discountId) return errorRes("Discount id is required", 400);

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

    const discountExist = await db.query.discounts.findFirst({
      where: (d, { eq }) => eq(d.id, discountId),
    });

    if (!discountExist) return errorRes("Discount not found", 404);

    const applyMap = {
      categories: discountCategories,
      suppliers: discountSuppliers,
      pets: discountPets,
      products: discountProductVariants,
    };
    const keyMap = {
      products: "variantId",
      categories: "categoryId",
      suppliers: "supplierId",
      pets: "petId",
      users: "userId",
      roles: "role",
    };

    await db.transaction(async (tx) => {
      // 1. Update main discount
      await tx
        .update(discounts)
        .set({
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
        .where(eq(discounts.id, discountId));

      // 2. Handle applyTo
      const applyTable = applyMap[applyType];
      if (applyTable) {
        await tx
          .delete(applyTable)
          .where(eq(applyTable.discountId, discountId));
        if (apply.length > 0) {
          await tx.insert(applyTable).values(
            apply.map((id) => ({
              discountId,
              [keyMap[applyType]]: id,
            }))
          );
        }
      }

      // 3. Handle eligibility
      if (eligibilityType === "role") {
        await tx
          .delete(discountToRoles)
          .where(eq(discountToRoles.discountId, discountId));
        if (eligibility.length > 0) {
          await tx.insert(discountToRoles).values(
            eligibility.map((role) => ({
              discountId,
              role: role as "BASIC" | "PETSHOP" | "VETERINARIAN",
            }))
          );
        }
      } else if (eligibilityType === "user") {
        await tx
          .delete(discountUsers)
          .where(eq(discountUsers.discountId, discountId));
        if (eligibility.length > 0) {
          await tx.insert(discountUsers).values(
            eligibility.map((userId) => ({
              discountId,
              userId,
            }))
          );
        }
      }
    });

    return successRes({ id: discountId }, "Discount successfully updated");
  } catch (error) {
    console.error("ERROR_UPDATE_DISCOUNT:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ discountId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { discountId } = await params;

    if (!discountId) return errorRes("Discount id is required", 400);

    const discountExist = await db.query.discounts.findFirst({
      where: (d, { eq }) => eq(d.id, discountId),
    });

    if (!discountExist) return errorRes("Discount not found", 404);

    await db.delete(discounts).where(eq(discounts.id, discountId));

    return successRes(null, "Discount successfully deleted");
  } catch (error) {
    console.log("ERROR_DELETE_DISCOUNT:", error);
    return errorRes("Internal Error", 500);
  }
}
