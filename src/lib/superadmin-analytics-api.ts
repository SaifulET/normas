import { apiRequest, type ApiSuccessResponse } from "./api";

export type SuperadminAnalyticsRange = "today" | "7d" | "30d" | "custom";

export type SuperadminAnalyticsStat = {
  accent?: "green" | "red";
  change?: string;
  icon?: "edit";
  label: string;
  note: string;
  value: string;
};

export type SuperadminAnalyticsSubscriber = {
  dateJoined: string;
  id: string;
  initials: string;
  joinedAt?: string;
  name: string;
  payment: "Paid" | "Pending" | "Failed" | "Active";
  plan: string;
};

export type SuperadminAnalyticsData = {
  barLabels: string[];
  bars: number[];
  lineLabels: string[];
  lines: {
    basic: number[];
    investee: number[];
    pro: number[];
  };
  pie: Array<{ color: string; count: number; label: string; value: number }>;
  pieTotal: number;
  stats: SuperadminAnalyticsStat[];
  subscribers: SuperadminAnalyticsSubscriber[];
};

export type SuperadminAnalyticsQuery = {
  endDate?: string;
  range?: SuperadminAnalyticsRange;
  startDate?: string;
};

export function getSuperadminDashboardAnalytics(params: SuperadminAnalyticsQuery = {}) {
  return apiRequest<ApiSuccessResponse<SuperadminAnalyticsData>>({
    method: "GET",
    params,
    url: "admin/analytics/dashboard",
  });
}
