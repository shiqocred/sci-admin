import { auth, errorRes, successRes } from "@/lib/auth";
import { db, faqs } from "@/lib/db";
import { eq, gt, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ faqId: string }> }
) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const { faqId } = await params;

    const faqRes = await db.query.faqs.findFirst({
      columns: {
        id: true,
        question: true,
        answer: true,
      },
      where: (f, { eq }) => eq(f.id, faqId),
    });

    if (!faqRes) return errorRes("Faq not found", 404);

    return successRes(faqRes, "Retrieve faq");
  } catch (error) {
    console.error("ERROR_GET_FAQ:", error);
    return errorRes("Internal Error", 500);
  }
}

const faqSchema = z.object({
  question: z.string().min(1, { message: "Question is required" }),
  answer: z.string().min(1, { message: "Answer is required" }),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ faqId: string }> }
) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const body = await req.json();

    const { faqId } = await params;

    const result = faqSchema.safeParse(body);

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      return errorRes("Validation failed", 400, errors);
    }

    const { question, answer } = result.data;

    const faqExist = await db.query.faqs.findFirst({
      where: (f, { eq }) => eq(f.id, faqId),
    });

    if (!faqExist) return errorRes("Faq not found", 404);

    await db
      .update(faqs)
      .set({
        question,
        answer,
        updatedAt: sql`NOW()`,
      })
      .where(eq(faqs.id, faqId));

    return successRes({ id: faqId }, "Faq successfully updated");
  } catch (error) {
    console.error("ERROR_UPDATE_FAQ:", error);
    return errorRes("Internal Error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ faqId: string }> }
) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const { faqId } = await params;

    const faqExist = await db.query.faqs.findFirst({
      where: (f, { eq }) => eq(f.id, faqId),
    });

    if (!faqExist) return errorRes("Account not found", 404);

    const deletedPosition = faqExist.position;

    await db.delete(faqs).where(eq(faqs.id, faqId));

    await db
      .update(faqs)
      .set({ position: sql`${faqs.position} - 1` })
      .where(gt(faqs.position, deletedPosition));

    return successRes(null, "Faq successfully deleted");
  } catch (error) {
    console.error("ERROR_DELETE_FAQ:", error);
    return errorRes("Internal Error", 500);
  }
}
