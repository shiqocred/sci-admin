import { useApiQuery } from "@/lib/query/use-query";
import { dataQuery } from "./data";
import { DashboardRangeProps } from "./types";

export const useGetDashboard = () => useApiQuery(dataQuery().dashboard);

export const useGetDashboardRange = ({ mode, from, to }: DashboardRangeProps) =>
  useApiQuery(dataQuery(mode, from, to).dashboardRange);
