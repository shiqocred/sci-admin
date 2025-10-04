import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { db, orders, roleUserEnum, userRoleDetails, users } from "@/lib/db";
import { fastPagination } from "@/lib/pagination";
import { buildWhereClause } from "@/lib/search";
import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  max,
  min,
  not,
  sql,
  sum,
  gte,
  lte,
  countDistinct,
} from "drizzle-orm";
import { NextRequest } from "next/server";

type RoleType = (typeof roleUserEnum)["enumValues"][number];

const getSortField = (s: string) => {
  if (s === "name") return users.name;
  if (s === "email") return users.email;
  if (s === "orders") return count(orders.id);
  if (s === "spent") return sum(orders.totalPrice);
  return users.createdAt;
};

const formatRole = (
  role: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN" | null
) => {
  if (role === "BASIC") return "Basic";
  if (role === "PETSHOP") return "Pet Shop";
  return "Veterinarian";
};

const formatStatus = (status: "PENDING" | "APPROVED" | "REJECTED" | null) => {
  if (status === "PENDING") return 1;
  if (status === "REJECTED") return 2;
  return 0;
};

const getFiltersBase = (
  roles: string[],
  status: string | null,
  approval: string | null
) => {
  const filters = [];
  filters.push(not(eq(users.role, "ADMIN")));
  filters.push(isNull(users.deletedAt));
  if (roles.length) {
    filters.push(
      inArray(
        users.role,
        roles.map((i) => i.toUpperCase() as RoleType)
      )
    );
  }
  if (status === "verified") {
    filters.push(isNotNull(users.emailVerified));
  } else if (status === "not-verified") {
    filters.push(isNull(users.emailVerified));
  }
  if (approval === "true") {
    filters.push(eq(userRoleDetails.status, "PENDING"));
  }
  return filters;
};

const getFilterOrder = (minOrder: string | null, maxOrder: string | null) => {
  const filters = [];
  if (minOrder && maxOrder) {
    filters.push(
      and(
        gte(count(orders.id), Number(minOrder)),
        lte(count(orders.id), Number(maxOrder))
      )
    );
  }
  return filters;
};

const getFilterSpent = (minSpent: string | null, maxSpent: string | null) => {
  const filters = [];
  if (minSpent && maxSpent) {
    const spentExpr = sql`COALESCE(${sum(orders.totalPrice)}, 0)`;
    filters.push(
      and(gte(spentExpr, Number(minSpent)), lte(spentExpr, Number(maxSpent)))
    );
  }
  return filters;
};

export async function GET(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") ?? "";
    const sort = req.nextUrl.searchParams.get("sort") ?? "created";
    const order = req.nextUrl.searchParams.get("order") ?? "desc";

    const roles = req.nextUrl.searchParams.getAll("role").filter(Boolean);
    const status = req.nextUrl.searchParams.get("status");
    const approval = req.nextUrl.searchParams.get("approval");
    const minOrder = req.nextUrl.searchParams.get("minOrder");
    const maxOrder = req.nextUrl.searchParams.get("maxOrder");
    const minSpent = req.nextUrl.searchParams.get("minSpent");
    const maxSpent = req.nextUrl.searchParams.get("maxSpent");

    const filtersBase = getFiltersBase(roles, status, approval);
    const filterOrder = getFilterOrder(minOrder, maxOrder);
    const filterSpent = getFilterSpent(minSpent, maxSpent);

    const joinOrderWhere = and(
      eq(orders.userId, users.id),
      and(
        not(eq(orders.status, "WAITING_PAYMENT")),
        not(eq(orders.status, "CANCELLED")),
        not(eq(orders.status, "EXPIRED"))
      )
    );

    const joinRoleWhere = eq(userRoleDetails.userId, users.id);

    const searchClause = buildWhereClause(q, [users.name, users.email]);
    const baseWhere = and(searchClause, ...filtersBase);

    const [baseQuery] = await db
      .select({ count: countDistinct(users.id) })
      .from(users)
      .leftJoin(orders, joinOrderWhere)
      .leftJoin(userRoleDetails, joinRoleWhere)
      .where(baseWhere)
      .having(and(...filterOrder, ...filterSpent));
    const total = baseQuery?.count ?? 0;
    const { offset, limit, pagination } = fastPagination({ req, total });

    const customersBase = db
      .select({
        userId: users.id,
        orders: count(orders.id).as("orders"),
        amountSpent: sql`COALESCE(${sum(orders.totalPrice)}, 0)`.as(
          "amountSpent"
        ),
      })
      .from(users)
      .leftJoin(orders, joinOrderWhere)
      .leftJoin(userRoleDetails, joinRoleWhere)
      .where(baseWhere)
      .groupBy(users.id, userRoleDetails.status, userRoleDetails.newRole)
      .as("customers_base");

    const [customersRes, [minAndMax]] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          isVerified: users.emailVerified,
          role: users.role,
          image: users.image,
          status_role: userRoleDetails.status,
          newRole: userRoleDetails.newRole,
          orders: countDistinct(orders.id).as("orders"),
          amountSpent: sum(orders.totalPrice).as("amountSpent"),
        })
        .from(users)
        .leftJoin(orders, joinOrderWhere)
        .leftJoin(userRoleDetails, joinRoleWhere)
        .where(baseWhere)
        .groupBy(users.id, userRoleDetails.status, userRoleDetails.newRole)
        .orderBy(
          order === "desc" ? desc(getSortField(sort)) : asc(getSortField(sort))
        )
        .having(and(...filterOrder, ...filterSpent))
        .limit(limit)
        .offset(offset),
      db
        .select({
          minOrder: sql<string>`COALESCE(${min(customersBase.orders)}, 0)`.as(
            "minOrders"
          ),
          maxOrder: sql<string>`COALESCE(${max(customersBase.orders)}, 0)`.as(
            "maxOrders"
          ),
          minSpent:
            sql<string>`COALESCE(${min(customersBase.amountSpent)}, 0)`.as(
              "minSpent"
            ),
          maxSpent:
            sql<string>`COALESCE(${max(customersBase.amountSpent)}, 0)`.as(
              "maxSpent"
            ),
        })
        .from(customersBase),
    ]);

    const customersFormatted = customersRes.map(
      ({
        id,
        name,
        email,
        isVerified,
        role,
        image,
        status_role,
        newRole,
        orders,
        amountSpent,
      }) => ({
        id,
        name,
        email,
        isVerified: isVerified !== null,
        role: formatRole(role),
        image: image ? `${r2Public}/${image}` : null,
        status_role: formatStatus(status_role),
        newRole: formatRole(newRole),
        orders: Number(orders),
        amountSpent: Number(amountSpent ?? 0),
      })
    );

    return successRes(
      {
        data: customersFormatted,
        pagination,
        option: minAndMax,
        current: {
          minOrder:
            !minOrder || Number(minOrder) < Number(minAndMax.minOrder)
              ? minAndMax.minOrder
              : minOrder,
          maxOrder:
            !maxOrder || Number(maxOrder) > Number(minAndMax.maxOrder)
              ? minAndMax.maxOrder
              : maxOrder,
          minSpent:
            !minSpent || Number(minSpent) < Number(minAndMax.minSpent)
              ? minAndMax.minSpent
              : minSpent,
          maxSpent:
            !maxSpent || Number(maxSpent) > Number(minAndMax.maxSpent)
              ? minAndMax.maxSpent
              : maxSpent,
        },
      },
      "Customer list"
    );
  } catch (error) {
    console.log("ERROR_GET_CUSTOMERS", error);
    return errorRes("Internal Error", 500);
  }
}
