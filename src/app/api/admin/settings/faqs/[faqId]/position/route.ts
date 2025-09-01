import { auth, errorRes, successRes } from "@/lib/auth";
import { db, faqs } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ faqId: string }> }
) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const { direction } = await req.json();

    const { faqId } = await params;

    if (direction !== "up" && direction !== "down")
      return errorRes("Invalid direction, valid: 'up' or 'down'");

    const faqExist = await db.query.faqs.findFirst({
      where: (f, { eq }) => eq(f.id, faqId),
    });

    if (!faqExist) return errorRes("Faq not found", 404);

    await db
      .update(faqs)
      .set({
        position:
          direction === "up" ? faqExist.position - 1 : faqExist.position + 1,
      })
      .where(eq(faqs.id, faqId));

    return successRes({ id: faqId }, "Faq position successfully updated");
  } catch (error) {
    console.error("ERROR_UPDATE_FAQ_POSITION:", error);
    return errorRes("Internal Error", 500);
  }
}
