import { auth, errorRes, successRes } from "@/lib/auth";
import { db, testimonies, users } from "@/lib/db";
import { fastPagination } from "@/lib/pagination";
import { buildWhereClause } from "@/lib/search";
import { and, asc, countDistinct, desc, eq, inArray, sql } from "drizzle-orm";
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
    const userId = req.nextUrl.searchParams.getAll("userId").filter(Boolean);
    const status = req.nextUrl.searchParams.get("status");
    const minRating = req.nextUrl.searchParams.get("minRating");
    const maxRating = req.nextUrl.searchParams.get("maxRating");

    const filters = [];
    if (userId.length) {
      filters.push(inArray(users.id, userId));
    }
    if (status === "publish") {
      filters.push(eq(testimonies.isActive, true));
    } else if (status === "unpublish") {
      filters.push(eq(testimonies.isActive, false));
    }
    if (minRating && maxRating) {
      filters.push(
        and(
          sql`${testimonies.rating}::integer >= ${Number(minRating)}`,
          sql`${testimonies.rating}::integer <= ${Number(maxRating)}`
        )
      );
    }

    const joinUser = eq(users.id, testimonies.userId);

    const searchClause = buildWhereClause(q, [testimonies.title]);
    const baseWhere = and(searchClause, ...filters);

    const [baseQuery] = await db
      .select({ count: countDistinct(testimonies.id) })
      .from(testimonies)
      .leftJoin(users, joinUser)
      .where(baseWhere);
    const total = baseQuery?.count ?? 0;
    const { offset, limit, pagination } = fastPagination({ req, total });

    const testimoniesRes = await db
      .select({
        id: testimonies.id,
        title: testimonies.title,
        rating: testimonies.rating,
        status: testimonies.isActive,
        user: users.name,
      })
      .from(testimonies)
      .leftJoin(users, joinUser)
      .where(baseWhere)
      .groupBy(testimonies.id, users.id)
      .orderBy(order === "desc" ? desc(sortField(sort)) : asc(sortField(sort)))
      .limit(limit)
      .offset(offset);

    const [customers] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
        })
        .from(users)
        .innerJoin(testimonies, joinUser)
        .groupBy(users.id, users.name),
    ]);

    const response = testimoniesRes.map((testimoni) => ({
      ...testimoni,
      rating: Number(testimoni.rating),
    }));

    return successRes(
      {
        data: response,
        pagination,
        options: { customers },
        current: {
          minRating:
            Number(minRating) < 1 || Number(minRating) > 5
              ? 1
              : Number(minRating),
          maxRating:
            Number(maxRating) < 1 || Number(maxRating) > 5
              ? 5
              : Number(maxRating),
        },
      },
      "Retreive testimonies"
    );
  } catch (error) {
    console.error("ERROR_GET_TESTIMONIES:", error);
    return errorRes("Internal Error", 500);
  }
}
