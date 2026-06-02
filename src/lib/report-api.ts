import { apiRequest } from "./api";
import type { ListItemResponse, ListUser } from "./list-api";

export type ReportStatus = "pending" | "dismiss" | "solved" | string;

export type ReportUser = ListUser & {
  id?: string;
};

export type ReportList = Pick<
  ListItemResponse,
  "_id" | "bannerImage" | "country" | "createdAt" | "fundingTarget" | "sector" | "stage" | "status" | "title" | "updatedAt" | "user" | "viewCount"
>;

export type Report = {
  _id: string;
  createdAt?: string;
  description?: string;
  list?: ReportList | string;
  status?: ReportStatus;
  updatedAt?: string;
  user?: ReportUser | string;
};

type ReportEnvelope<T> = {
  data?: T;
  message?: string;
  success?: boolean;
};

export function createReport(data: { description: string; listId: string }) {
  return apiRequest<ReportEnvelope<Report>>({
    data,
    method: "POST",
    url: "reports",
  });
}

export function getReports() {
  return apiRequest<ReportEnvelope<Report[]>>({
    method: "GET",
    url: "reports",
  });
}

export function getReport(reportId: string) {
  return apiRequest<ReportEnvelope<Report>>({
    method: "GET",
    url: `reports/${reportId}`,
  });
}

export function updateReportStatus(reportId: string, status: ReportStatus) {
  return apiRequest<ReportEnvelope<Report>>({
    data: { status },
    method: "PATCH",
    url: `reports/${reportId}/status`,
  });
}

export function deleteReport(reportId: string) {
  return apiRequest<ReportEnvelope<{ id?: string; message?: string }>>({
    method: "DELETE",
    url: `reports/${reportId}`,
  });
}
