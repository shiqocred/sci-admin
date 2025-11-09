import { UseApiQueryProps } from "@/lib/query/use-query";
import { DashboardResponse, RangeResponse } from "./types";

export const dataQuery = (
  mode?: string,
  from?: string,
  to?: string
): {
  dashboard: UseApiQueryProps<DashboardResponse>;
  dashboardRange: UseApiQueryProps<RangeResponse>;
} => {
  return {
    dashboard: {
      key: ["get-dashboard"],
      endpoint: "/admin/dashboard",
    },
    dashboardRange: {
      key: ["get-dashboard-range", { mode, from, to }],
      endpoint: "/admin/dashboard/range",
      searchParams: { mode, from, to },
    },
  };
};
