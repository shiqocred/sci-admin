import { auth, errorRes, successRes } from "@/lib/auth";
import {
  db,
  freeShippings,
  freeShippingApplies,
  freeShippingEligibilities,
} from "@/lib/db";
import { eq, inArray, InferSelectModel } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

type RoleType = InferSelectModel<typeof freeShippingEligibilities>["role"];
type NonNullRoleType = Exclude<RoleType, null>;

export const updatefreeShippingSchema = z.object({
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

const handleAppliesUpdate = async (
  tx: any,
  freeShippingId: string,
  freeShippingExist: InferSelectModel<typeof freeShippings>,
  apply: string[],
  applyType: InferSelectModel<typeof freeShippings>["apply"]
) => {
  const buildApplyValues = (
    ids: string[],
    type: InferSelectModel<typeof freeShippings>["apply"]
  ) =>
    ids.map((i) => ({
      freeShippingId,
      categoryId: type === "categories" ? i : null,
      variantId: type === "products" ? i : null,
      supplierId: type === "suppliers" ? i : null,
      petId: type === "pets" ? i : null,
    }));

  if (freeShippingExist.apply !== applyType) {
    await tx
      .delete(freeShippingApplies)
      .where(eq(freeShippingApplies.freeShippingId, freeShippingId));
    await tx
      .insert(freeShippingApplies)
      .values(buildApplyValues(apply, applyType));
    return;
  }
  const appliesExists = await db.query.freeShippingApplies.findMany({
    where: (fsa, { eq }) => eq(fsa.freeShippingId, freeShippingId),
  });
  const appliesFormated = appliesExists.map((i) => {
    switch (freeShippingExist.apply) {
      case "categories":
        return i.categoryId as string;
      case "suppliers":
        return i.supplierId as string;
      case "products":
        return i.variantId as string;
      default:
        return i.petId as string;
    }
  });
  const newApply = apply.filter((i) => !appliesFormated.includes(i));
  const deleteApply = appliesFormated.filter((i) => !apply.includes(i));
  if (newApply.length > 0) {
    await tx
      .insert(freeShippingApplies)
      .values(buildApplyValues(newApply, freeShippingExist.apply));
  }
  const deleteMap: Record<string, any> = {
    categories: freeShippingApplies.categoryId,
    pets: freeShippingApplies.petId,
    products: freeShippingApplies.variantId,
    suppliers: freeShippingApplies.supplierId,
  };
  const deleteColumn = deleteMap[freeShippingExist.apply];
  if (deleteColumn) {
    await tx
      .delete(freeShippingApplies)
      .where(inArray(deleteColumn, deleteApply));
  }
};

const handleEligibilityUpdate = async (
  tx: any,
  freeShippingId: string,
  freeShippingExist: InferSelectModel<typeof freeShippings>,
  eligibility: string[],
  eligibilityType: string
) => {
  if (freeShippingExist.eligibilityType !== eligibilityType) {
    await tx
      .delete(freeShippingEligibilities)
      .where(eq(freeShippingEligibilities.freeShippingId, freeShippingId));
    await tx.insert(freeShippingEligibilities).values(
      eligibility.map((i) => ({
        freeShippingId,
        role: eligibilityType === "role" ? (i as RoleType) : null,
        userId: eligibilityType === "user" ? i : null,
      }))
    );
    return;
  }
  const eligibilitiesExist = await db.query.freeShippingEligibilities.findMany({
    where: (fsa, { eq }) => eq(fsa.freeShippingId, freeShippingId),
  });
  const eligibilitiesFormatted = eligibilitiesExist.map((i) =>
    freeShippingExist.eligibilityType === "role"
      ? (i.role as string)
      : (i.userId as string)
  );
  const newEligibilities = eligibility.filter(
    (i) => !eligibilitiesFormatted.includes(i)
  );
  const deleteEligibilities = eligibilitiesFormatted.filter(
    (i) => !eligibility.includes(i)
  );
  if (newEligibilities.length > 0) {
    await tx.insert(freeShippingEligibilities).values(
      newEligibilities.map((i) => ({
        freeShippingId,
        role:
          freeShippingExist.eligibilityType === "role" ? (i as RoleType) : null,
        userId: freeShippingExist.eligibilityType === "user" ? i : null,
      }))
    );
  }
  if (deleteEligibilities.length > 0) {
    if (freeShippingExist.eligibilityType === "role") {
      const validDeleteEligibilities = deleteEligibilities.filter(
        (r): r is NonNullRoleType => r !== null
      );
      if (validDeleteEligibilities.length > 0) {
        await tx
          .delete(freeShippingEligibilities)
          .where(
            inArray(freeShippingEligibilities.role, validDeleteEligibilities)
          );
      }
    } else if (freeShippingExist.eligibilityType === "user") {
      await tx
        .delete(freeShippingEligibilities)
        .where(inArray(freeShippingEligibilities.userId, deleteEligibilities));
    }
  }
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ freeShippingId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { freeShippingId } = await params;

    if (!freeShippingId) return errorRes("Free shipping id is required", 400);

    const freeShippingRes = await db.query.freeShippings.findFirst({
      where: (d, { eq }) => eq(d.id, freeShippingId),
    });

    if (!freeShippingRes) return errorRes("Free Shipping not found", 404);

    const freeShippingAppliesRes = await db.query.freeShippingApplies.findMany({
      where: (d, { eq }) => eq(d.freeShippingId, freeShippingId),
    });

    const eligibilityRes = await db.query.freeShippingEligibilities.findMany({
      where: (d, { eq }) => eq(d.freeShippingId, freeShippingId),
    });

    const statusFormat = () => {
      const { startAt, endAt } = freeShippingRes;
      const now = Date.now();
      const start = new Date(startAt).getTime();
      const end = endAt ? new Date(endAt).getTime() : null;

      if (end && end < start) return "expired";
      if (now < start) return "scheduled";
      if (!end || now <= end) return "active";
      return "expired";
    };

    const formatApplies = (item: (typeof freeShippingRes)["apply"]) => {
      const map: Record<string, keyof (typeof freeShippingAppliesRes)[0]> = {
        categories: "categoryId",
        pets: "petId",
        products: "variantId",
        suppliers: "supplierId",
      };
      const key = map[item] ?? "supplierId";
      return freeShippingAppliesRes.map((i) => i[key] as string);
    };

    const formatEligibility = (
      item: (typeof freeShippingRes)["eligibilityType"]
    ) => {
      if (item === "role") return eligibilityRes.map((i) => i.role as string);
      if (item === "user") return eligibilityRes.map((i) => i.userId as string);
      return [];
    };

    const response = {
      apply: formatApplies(freeShippingRes.apply),
      applyType: freeShippingRes.apply,
      eligibility: formatEligibility(freeShippingRes.eligibilityType),
      eligibilityType: freeShippingRes.eligibilityType,
      limitOnce: freeShippingRes.maxUserOnce,
      limitUse: freeShippingRes.maxTotalUse,
      minimum: freeShippingRes.minimum,
      minimumType: freeShippingRes.minimumType,
      name: freeShippingRes.name,
      startFreeShipping: freeShippingRes.startAt,
      endFreeShipping: freeShippingRes.endAt,
      status: statusFormat(),
    };

    return successRes(response, "Free shipping detail");
  } catch (error) {
    console.log("ERROR_SHOW_FREE_SHIPPING:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ freeShippingId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { freeShippingId } = await params;
    if (!freeShippingId) return errorRes("Free shipping id is required", 400);

    const body = await req.json();
    const result = updatefreeShippingSchema.safeParse(body);

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
      startFreeShipping,
      endFreeShipping,
      name,
    } = result.data;

    const freeShippingsExist = await db.query.freeShippings.findMany({
      columns: { name: true },
    });

    const freeShippingExist = await db.query.freeShippings.findFirst({
      where: (d, { eq }) => eq(d.id, freeShippingId),
    });

    if (!freeShippingExist) return errorRes("Free shipping not found", 404);

    if (
      freeShippingsExist.filter(
        (i) => i.name.toLowerCase() === name.toLowerCase()
      ).length > 0 &&
      freeShippingExist.name !== name
    )
      return errorRes("Validation failed", 400, {
        name: `Name ${name} already exits`,
      });

    await db.transaction(async (tx) => {
      await tx
        .update(freeShippings)
        .set({
          name,
          apply: applyType,
          minimumType: minimumType !== "nothing" ? minimumType : null,
          eligibilityType: eligibilityType !== "all" ? eligibilityType : null,
          minimum: minimum ?? null,
          maxTotalUse: limitUse ?? null,
          maxUserOnce: limitOnce,
          startAt: new Date(startFreeShipping),
          endAt: endFreeShipping ? new Date(endFreeShipping) : null,
        })
        .where(eq(freeShippings.id, freeShippingId));

      await handleAppliesUpdate(
        tx,
        freeShippingId,
        freeShippingExist,
        apply,
        applyType
      );

      if (eligibility) {
        await handleEligibilityUpdate(
          tx,
          freeShippingId,
          freeShippingExist,
          eligibility,
          eligibilityType
        );
      }
    });

    return successRes(
      { id: freeShippingId },
      "Free shipping successfully updated"
    );
  } catch (error) {
    console.error("ERROR_UPDATE_FREE_SHIPPING:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ freeShippingId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { freeShippingId } = await params;

    if (!freeShippingId) return errorRes("Free shipping id is required", 400);

    const freeShippingExist = await db.query.freeShippings.findFirst({
      where: (d, { eq }) => eq(d.id, freeShippingId),
    });

    if (!freeShippingExist) return errorRes("Free shipping not found", 404);

    await db.delete(freeShippings).where(eq(freeShippings.id, freeShippingId));

    return successRes(null, "Free shipping successfully deleted");
  } catch (error) {
    console.log("ERROR_DELETE_FREE_SHIPPING:", error);
    return errorRes("Internal Error", 500);
  }
}
