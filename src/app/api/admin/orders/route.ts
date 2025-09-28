import { auth, errorRes, successRes } from "@/lib/auth";
import {
  db,
  orderItems,
  orders,
  users,
  productVariants,
  products,
  orderStatusEnum,
} from "@/lib/db";
import { fastPagination } from "@/lib/pagination";
import { buildWhereClause } from "@/lib/search";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  asc,
  countDistinct,
  desc,
  eq,
  inArray,
  max,
  min,
  and,
  sql,
  gte,
  lte,
} from "drizzle-orm";
import { NextRequest } from "next/server";

const sortField = (s: string) => {
  const map: Record<string, typeof orders.id | typeof orders.createdAt> = {
    id: orders.id,
    created: orders.createdAt,
  };
  return map[s] || orders.createdAt;
};

const formatStatus = (
  status:
    | "WAITING_PAYMENT"
    | "PACKING"
    | "SHIPPING"
    | "DELIVERED"
    | "EXPIRED"
    | "CANCELLED"
) => {
  const map: Record<string, string> = {
    WAITING_PAYMENT: "waiting-payment",
    PACKING: "processed",
    SHIPPING: "shipping",
    DELIVERED: "delivered",
    EXPIRED: "expired",
    CANCELLED: "cancelled",
  };
  return map[status] || "cancelled";
};

type OrderType = (typeof orderStatusEnum)["enumValues"][number];

const getFilters = (
  userId: string[],
  status: string[],
  minPrice: string | null,
  maxPrice: string | null,
  minDateFormatted: Date | null,
  maxDateFormatted: Date | null
) => {
  const filters = [];
  if (userId.length) {
    filters.push(inArray(users.id, userId));
  }
  if (status.length) {
    filters.push(
      inArray(
        orders.status,
        status.map((i) => {
          if (i === "processed") {
            return "PACKING";
          }
          return i.split("-").join("_").toUpperCase() as OrderType;
        })
      )
    );
  }
  if (minPrice && maxPrice) {
    filters.push(
      and(
        sql`${orders.totalPrice}::integer >= ${Number(minPrice)}`,
        sql`${orders.totalPrice}::integer >= ${Number(maxPrice)}`
      )
    );
  }
  if (minDateFormatted && maxDateFormatted) {
    filters.push(
      gte(orders.createdAt, minDateFormatted),
      lte(orders.createdAt, maxDateFormatted)
    );
  }

  return filters;
};

const getHavingFilter = (
  minProduct: string | null,
  maxProduct: string | null
) => {
  const filters = [];
  if (minProduct && maxProduct) {
    filters.push(
      gte(sql`COALESCE(${products.id},0)`, minProduct),
      lte(sql`COALESCE(${products.id},0)`, maxProduct)
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

    const userId = req.nextUrl.searchParams.getAll("userId").filter(Boolean);
    const status = req.nextUrl.searchParams.getAll("status").filter(Boolean);
    const minPrice = req.nextUrl.searchParams.get("minPrice");
    const maxPrice = req.nextUrl.searchParams.get("maxPrice");
    const minProduct = req.nextUrl.searchParams.get("minProduct");
    const maxProduct = req.nextUrl.searchParams.get("maxProduct");
    const minDate = req.nextUrl.searchParams.get("minDate");
    const maxDate = req.nextUrl.searchParams.get("maxDate");

    const minDateFormatted = minDate ? new Date(minDate) : null;
    const maxDateFormatted = maxDate ? new Date(maxDate) : null;

    const filters = getFilters(
      userId,
      status,
      minPrice,
      maxPrice,
      minDateFormatted,
      maxDateFormatted
    );

    const hFilters = getHavingFilter(minProduct, maxProduct);

    const joinUser = eq(users.id, orders.userId);
    const joinOrderItems = eq(orderItems.orderId, orders.id);
    const joinProductVariant = eq(orderItems.variantId, productVariants.id);
    const joinProduct = eq(productVariants.productId, products.id);

    const searchClause = buildWhereClause(q, [users.name, users.email]);
    const baseWhere = and(searchClause, ...filters);

    const [baseQuery] = await db
      .select({ count: countDistinct(orders.id) })
      .from(orders)
      .leftJoin(users, joinUser)
      .leftJoin(orderItems, joinOrderItems)
      .leftJoin(productVariants, joinProductVariant)
      .leftJoin(products, joinProduct)
      .where(baseWhere)
      .having(and(...hFilters));
    const total = baseQuery?.count ?? 0;
    const { offset, limit, pagination } = fastPagination({ req, total });

    const productCountSub = db
      .select({
        orderId: orders.id,
        productCount: countDistinct(products).as("productCount"),
      })
      .from(orders)
      .leftJoin(orderItems, joinOrderItems)
      .leftJoin(productVariants, joinProductVariant)
      .leftJoin(products, joinProduct)
      .groupBy(orders.id)
      .as("productCountSub");

    const [ordersRes, customersRes, [aggregateRes]] = await Promise.all([
      db
        .select({
          id: orders.id,
          date: orders.createdAt,
          status: orders.status,
          total_price: orders.totalPrice,
          total_item: countDistinct(products.id),
          user_name: users.name,
        })
        .from(orders)
        .leftJoin(users, joinUser)
        .leftJoin(orderItems, joinOrderItems)
        .leftJoin(productVariants, joinProductVariant)
        .leftJoin(products, joinProduct)
        .where(baseWhere)
        .groupBy(orders.id, users.id)
        .orderBy(
          order === "desc" ? desc(sortField(sort)) : asc(sortField(sort))
        )
        .having(and(...hFilters))
        .limit(limit)
        .offset(offset),
      db
        .select({
          id: users.id,
          name: users.name,
        })
        .from(users)
        .innerJoin(orders, joinUser)
        .groupBy(users.id, users.name),
      db
        .select({
          minPrice: min(orders.totalPrice),
          maxPrice: max(orders.totalPrice),
          minProduct: min(productCountSub.productCount),
          maxProduct: max(productCountSub.productCount),
          minDate: min(orders.createdAt),
          maxDate: max(orders.createdAt),
        })
        .from(orders)
        .leftJoin(productCountSub, eq(productCountSub.orderId, orders.id)),
    ]);

    const response = {
      data: ordersRes.map((item) => ({
        ...item,
        date: `${format(new Date(item.date ?? new Date()), "PP", { locale: id })} at ${format(
          new Date(item.date ?? new Date()),
          "HH:mm",
          { locale: id }
        )}`,
        status: formatStatus(item.status),
      })),
      pagination,
      option: {
        customers: customersRes,
        ...aggregateRes,
        minPrice: Number(aggregateRes.minPrice),
        maxPrice: Number(aggregateRes.maxPrice),
        minProduct: Number(aggregateRes.minProduct),
        maxProduct: Number(aggregateRes.maxProduct),
      },
      current: {
        minDate:
          !minDateFormatted ||
          !aggregateRes.minDate ||
          minDateFormatted < aggregateRes.minDate
            ? (aggregateRes.minDate as Date)
            : minDateFormatted,
        maxDate:
          !maxDateFormatted ||
          !aggregateRes.maxDate ||
          maxDateFormatted > aggregateRes.maxDate
            ? (aggregateRes.maxDate as Date)
            : maxDateFormatted,
        minPrice:
          !minPrice || Number(minPrice) < Number(aggregateRes.minPrice)
            ? Number(aggregateRes.minPrice)
            : Number(minPrice),
        maxPrice:
          !maxPrice || Number(maxPrice) > Number(aggregateRes.maxPrice)
            ? Number(aggregateRes.maxPrice)
            : Number(maxPrice),
        minProduct:
          !minProduct || Number(minProduct) < Number(aggregateRes.minProduct)
            ? Number(aggregateRes.minProduct)
            : Number(minProduct),
        maxProduct:
          !maxProduct || Number(maxProduct) > Number(aggregateRes.maxProduct)
            ? Number(aggregateRes.maxProduct)
            : Number(maxProduct),
      },
    };

    return successRes(response, "Retrieve Orders");
  } catch (error) {
    console.error("ERROR_GET_ORDERS:", error);
    return errorRes("Internal Error", 500);
  }
}
