import { auth, errorRes, successRes } from "@/lib/auth";
import { db, faqs } from "@/lib/db";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { asc, desc, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const sortField = (s: string) => {
  if (s === "question") return faqs.question;
  return faqs.position;
};

export async function GET(req: NextRequest) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") ?? "";
    const sort = req.nextUrl.searchParams.get("sort") ?? "position";
    const order = req.nextUrl.searchParams.get("order") ?? "asc";

    const { where, offset, limit, pagination } = await getTotalAndPagination(
      faqs,
      q,
      [faqs.question],
      req
    );

    const faqsRes = await db
      .select({
        id: faqs.id,
        question: faqs.question,
        isFirst: sql<boolean>`CASE WHEN ${faqs.position} = (SELECT MIN(${faqs.position}) FROM ${faqs}) THEN true ELSE false END`,
        isLast: sql<boolean>`CASE WHEN ${faqs.position} = (SELECT MAX(${faqs.position}) FROM ${faqs}) THEN true ELSE false END`,
      })
      .from(faqs)
      .where(where)
      .orderBy(order === "desc" ? desc(sortField(sort)) : asc(sortField(sort)))
      .limit(limit)
      .offset(offset);

    const response = {
      data: faqsRes,
      pagination,
    };

    return successRes(response, "Retrieve faqs");
  } catch (error) {
    console.error("ERROR_GET_FAQS:", error);
    return errorRes("Internal Error", 500);
  }
}

const faqSchema = z.object({
  question: z.string().min(1, { message: "Question is required" }),
  answer: z.string().min(1, { message: "Answer is required" }),
});

export async function POST(req: NextRequest) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const body = await req.json();

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

    const lastFaq = await db.query.faqs.findFirst({
      columns: { position: true },
      orderBy: desc(faqs.position),
    });

    let lastPosition: number = 0;

    if (lastFaq) {
      lastPosition = lastFaq.position;
    }

    await db.insert(faqs).values({
      answer,
      question,
      position: lastPosition + 1,
    });

    return successRes(null, "Faq successfully created");
  } catch (error) {
    console.error("ERROR_CREATE_FAQ:", error);
    return errorRes("Internal Error", 500);
  }
}
