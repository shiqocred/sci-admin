import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRole } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { id } from "date-fns/locale";
import { useGetDashboard } from "../../_api";

export const DashboardSummary = () => {
  const { data } = useGetDashboard();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 overflow-hidden border-gray-300 border rounded-lg shadow">
        <Card className="p-0 w-full border-none shadow-none rounded-none gap-0">
          <CardHeader className="flex justify-center gap-1 space-y-0 border-b !p-4 flex-col">
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>
              Showing total revenue for all periods
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 gap-0 flex items-center text-2xl h-20 font-bold">
            <p>{data?.data.total.income}</p>
          </CardContent>
        </Card>
        <Card className="p-0 w-full border-y-0 shadow-none rounded-none gap-0">
          <CardHeader className="flex justify-center gap-1 space-y-0 border-b !p-4 flex-col">
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>
              Showing total orders for all periods
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 gap-0 flex items-center text-2xl h-20 font-bold">
            <p>{data?.data.total.order}</p>
          </CardContent>
        </Card>
        <Card className="p-0 w-full border-none shadow-none rounded-none gap-0">
          <CardHeader className="flex justify-center gap-1 space-y-0 border-b !p-4 flex-col">
            <CardTitle>Total Customers</CardTitle>
            <CardDescription>
              Showing total customers for all periods
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 gap-0 flex items-center text-2xl h-20 font-bold">
            <p>{data?.data.total.customers}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-6 w-full">
        <div>
          <Card className="p-0 w-full gap-0">
            <CardHeader className="flex justify-center gap-1 space-y-0 border-b !p-4 flex-col">
              <CardTitle>Need Approving Document</CardTitle>
              <CardDescription>
                Showing customer needing approve upgrading role
              </CardDescription>
            </CardHeader>
            <CardContent className="py-2">
              {data && data.data.needed.approve_document.length > 0 ? (
                <ol className="divide-y text-sm">
                  {data?.data.needed.approve_document.map((doc) => (
                    <li key={doc.id}>
                      <Link
                        href={`/customers/${doc.id}`}
                        className="flex items-center group gap-2 py-2"
                      >
                        <TooltipText value={doc.name}>
                          <p className="w-full line-clamp-1 group-hover:underline underline-offset-2">
                            {doc.name}
                          </p>
                        </TooltipText>
                        <Badge>{formatRole(doc.role)}</Badge>
                        <button className="group-hover:-translate-x-1 group-hover:translate-y-1 transition-all">
                          <ArrowUpRight className="size-3" />
                        </button>
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="flex items-center justify-center py-8 text-sm font-medium">
                  <p>No Customers Record.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="p-0 w-full gap-0">
            <CardHeader className="flex justify-center gap-1 space-y-0 border-b !p-4 flex-col">
              <CardTitle>Need Proceed Order</CardTitle>
              <CardDescription>Showing order on proceed</CardDescription>
            </CardHeader>
            <CardContent className="py-2">
              {data && data?.data.needed.confirm_order.length > 0 ? (
                <ol className="divide-y text-sm">
                  {data?.data.needed.confirm_order.map((order) => (
                    <li key={order.id}>
                      <Link
                        href={`/orders/${order.id}`}
                        className="flex items-center group gap-2 py-2"
                      >
                        <p className="w-full line-clamp-1 group-hover:underline underline-offset-2">
                          #{order.id}
                        </p>
                        <Badge className="whitespace-nowrap">
                          {format(new Date(order.date), "PP", { locale: id })}
                        </Badge>
                        <button className="group-hover:-translate-x-1 group-hover:translate-y-1 transition-all">
                          <ArrowUpRight className="size-3" />
                        </button>
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="flex items-center justify-center py-8 text-sm font-medium">
                  <p>No Orders Record.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
