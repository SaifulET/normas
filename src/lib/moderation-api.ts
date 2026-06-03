import { apiRequest, type ApiSuccessResponse } from "./api";
import type { ListItemResponse } from "./list-api";

export type ModerationAlertStatus = "pending" | "reviewed" | string;

export type ModerationUser = {
  _id?: string;
  accountStatus?: string;
  email?: string;
  name?: string;
  profileImage?: string;
  role?: string;
};

export type ModerationAlert = {
  _id: string;
  actions?: Array<{
    action?: string;
    actor?: string;
    createdAt?: string;
    note?: string;
  }>;
  conversation?: string | null;
  createdAt?: string;
  decision?: string;
  detectedReasons?: string[];
  list?: ListItemResponse | null;
  message?: string;
  messageId?: string | null;
  metadata?: Record<string, unknown>;
  receiver?: ModerationUser | null;
  reviewedAt?: string | null;
  reviewedBy?: ModerationUser | null;
  sender?: ModerationUser | null;
  status?: ModerationAlertStatus;
  type?: string;
  updatedAt?: string;
  user?: ModerationUser | null;
};

export type ModerationAlertsData = {
  alerts: ModerationAlert[];
  pagination?: {
    limit?: number;
    page?: number;
    total?: number;
    totalPages?: number;
  };
  pendingCount?: number;
};

export type ModerationAlertQuery = {
  limit?: number;
  page?: number;
  status?: ModerationAlertStatus;
  type?: string;
};

export function getModerationAlerts(params: ModerationAlertQuery = {}) {
  return apiRequest<ApiSuccessResponse<ModerationAlertsData>>({
    method: "GET",
    params,
    url: "moderation/alerts",
  });
}

export function getModerationAlert(alertId: string) {
  return apiRequest<ApiSuccessResponse<ModerationAlert>>({
    method: "GET",
    url: `moderation/alerts/${alertId}`,
  });
}

export function markModerationAlertReviewed(alertId: string, note?: string) {
  return apiRequest<ApiSuccessResponse<ModerationAlert>>({
    data: { note },
    method: "PATCH",
    url: `moderation/alerts/${alertId}/review`,
  });
}

export function approveModerationPost(alertId: string, note?: string) {
  return apiRequest<ApiSuccessResponse<ModerationAlert>>({
    data: { note },
    method: "PATCH",
    url: `moderation/alerts/${alertId}/post/approve`,
  });
}

export function keepModerationPostSuspended(alertId: string, note?: string) {
  return apiRequest<ApiSuccessResponse<ModerationAlert>>({
    data: { note },
    method: "PATCH",
    url: `moderation/alerts/${alertId}/post/suspend`,
  });
}

export function deleteModerationPost(alertId: string, note?: string) {
  return apiRequest<ApiSuccessResponse<ModerationAlert>>({
    data: { note },
    method: "DELETE",
    url: `moderation/alerts/${alertId}/post`,
  });
}

export function warnModerationUser(alertId: string, note?: string) {
  return apiRequest<ApiSuccessResponse<ModerationAlert>>({
    data: { note },
    method: "POST",
    url: `moderation/alerts/${alertId}/user/warn`,
  });
}

export function suspendModerationUser(alertId: string, note?: string) {
  return apiRequest<ApiSuccessResponse<ModerationAlert>>({
    data: { note },
    method: "PATCH",
    url: `moderation/alerts/${alertId}/user/suspend`,
  });
}
