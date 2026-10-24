import { apiRequest, type ApiSuccessResponse } from "./api";

export type AdminBlockedIp = {
  blockedAt?: string;
  createdAt?: string;
  id: string;
  ip: string;
  lastRequestAt?: string;
  messageCount?: number;
  reason?: string;
  updatedAt?: string;
};

export type AdminBlockedIpsPagination = {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

type AdminBlockedIpsResponse = ApiSuccessResponse<{
  blockedIps?: AdminBlockedIp[];
  pagination?: AdminBlockedIpsPagination;
}>;

export function getBlockedIps(params: { limit?: number; page?: number; search?: string } = {}) {
  return apiRequest<AdminBlockedIpsResponse>({
    method: "GET",
    params,
    url: "admin/blocked-ips",
  });
}

export function unblockIp(blockedIpId: string) {
  return apiRequest<ApiSuccessResponse<{ id?: string; ip?: string; message?: string }>>({
    method: "DELETE",
    url: `admin/blocked-ips/${blockedIpId}`,
  });
}
