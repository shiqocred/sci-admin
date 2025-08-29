import { auth, errorRes, successRes } from "@/lib/auth";
import { db, testimonies, users } from "@/lib/db";
import { getTotalAndPagination } from "@/lib/db/pagination";
import { asc, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

const sortField = (s: string) => {
  if (s === "title") return testimonies.id;
  if (s === "rating") return testimonies.rating;
  if (s === "status") return testimonies.isActive;
  if (s === "user") return users.name;
  return testimonies.createdAt;
};

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") ?? "";
    const sort = req.nextUrl.searchParams.get("sort") ?? "created";
    const order = req.nextUrl.searchParams.get("order") ?? "desc";

    const { where, offset, limit, pagination } = await getTotalAndPagination(
      testimonies,
      q,
      [testimonies.title],
      req
    );

    const testimoniesRes = await db
      .select({
        id: testimonies.id,
        title: testimonies.title,
        rating: testimonies.rating,
        status: testimonies.isActive,
        user: users.name,
      })
      .from(testimonies)
      .leftJoin(users, eq(users.id, testimonies.userId))
      .where(where)
      .groupBy(testimonies.id, users.id)
      .orderBy(order === "desc" ? desc(sortField(sort)) : asc(sortField(sort)))
      .limit(limit)
      .offset(offset);

    const response = testimoniesRes.map((testimoni) => ({
      ...testimoni,
      rating: Number(testimoni.rating),
    }));

    return successRes({ data: response, pagination }, "Retreive testimonies");
  } catch (error) {
    console.error("ERROR_GET_TESTIMONIES:", error);
    return errorRes("Internal Error", 500);
  }
}
