import { auth, errorRes, successRes } from "@/lib/auth";
import { db, orders, users } from "@/lib/db";
import { formatRupiah, pronoun } from "@/lib/utils";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  isWithinInterval,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    if (!(await auth())) return errorRes("Unauthorized", 401);

    const mode = req.nextUrl.searchParams.get("mode") ?? "";
    const from = req.nextUrl.searchParams.get("from") ?? "";
    const to = req.nextUrl.searchParams.get("to") ?? "";

    const fromFormatted = new Date(from);
    const toFormatted = new Date(to);

    const ordersRes = await db
      .select({
        id: orders.id,
        amount: orders.totalPrice,
        date: orders.createdAt,
        userId: users.id,
        userName: users.name,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(
        and(
          eq(orders.status, "DELIVERED"),
          lte(orders.createdAt, toFormatted),
          gte(orders.createdAt, fromFormatted)
        )
      );

    /** 🔹 Total keseluruhan */
    const totalOrders = ordersRes.length;
    const totalAmount = ordersRes.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    /** 🔹 Interval harian/bulanan */
    const allDates =
      mode === "year"
        ? eachMonthOfInterval({ start: fromFormatted, end: toFormatted })
        : eachDayOfInterval({ start: fromFormatted, end: toFormatted });

    /** 🔹 Summary per tanggal */
    const summary = allDates.map((d) => {
      const start = mode === "year" ? startOfMonth(d) : startOfDay(d);
      const end = mode === "year" ? endOfMonth(d) : endOfDay(d);

      const dailyTx = ordersRes.filter(
        (tx) => tx.date && isWithinInterval(tx.date, { start, end })
      );

      const income = dailyTx.reduce((sum, tx) => sum + Number(tx.amount), 0);
      const order = dailyTx.length;

      return {
        date: start.toISOString(),
        income: formatRupiah(income),
        order: order.toLocaleString(),
      };
    });

    /** 🔹 Ranking pelanggan (Top 5) */
    const grouped = ordersRes.reduce(
      (acc, tx) => {
        if (!tx.userId || !tx.userName) return acc; // skip kalau user null

        const amount = Number(tx.amount);
        if (!acc[tx.userId]) {
          acc[tx.userId] = {
            id: tx.userId,
            name: tx.userName,
            amount: 0,
          };
        }
        acc[tx.userId].amount += amount;
        return acc;
      },
      {} as Record<string, { id: string; name: string; amount: number }>
    );

    const ranked = Object.values(grouped)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const response = {
      orders: summary,
      customers: ranked.map((rank) => ({
        ...rank,
        amount: formatRupiah(rank.amount),
      })),
      total: {
        order: `${totalOrders.toLocaleString()} order${pronoun(totalOrders)}`,
        amount: formatRupiah(totalAmount),
      },
    };

    return successRes(response, "Retrieve dashboard");
  } catch (error) {
    console.error("ERROR_GET_DASHBOARD:", error);
    return errorRes("Internal Error", 500);
  }
}
