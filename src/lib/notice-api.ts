import { apiRequest, type ApiSuccessResponse } from "./api";

export type NoticeTargetType = "investor" | "investee" | "all";
export type NoticeStatus = "processing" | "published" | "partially_failed" | "archived";
export type NoticeAudience = "investor" | "investee";

export type NoticeImage = {
  key: string;
  url: string;
};

export type NoticeEmailStats = {
  failed?: number;
  pending?: number;
  queued?: number;
  sent?: number;
  total?: number;
};

export type Notice = {
  _id: string;
  createdAt?: string;
  createdBy?: {
    _id?: string;
    email?: string;
    name?: string;
    role?: string;
  } | string | null;
  emailStats?: NoticeEmailStats;
  failedEmails?: Array<{
    _id?: string;
    attempts?: number;
    failedAt?: string;
    lastError?: string;
    recipientEmail?: string;
    updatedAt?: string;
  }>;
  image?: NoticeImage | null;
  isRead?: boolean;
  message: string;
  publishedAt?: string;
  readAt?: string | null;
  status: NoticeStatus;
  targetType: NoticeTargetType;
  title: string;
  updatedAt?: string;
};

export type NoticePagination = {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

export type NoticeListData = {
  notices?: Notice[];
  pagination?: NoticePagination;
};

export type NoticeListResponse = ApiSuccessResponse<NoticeListData>;
export type NoticeResponse = ApiSuccessResponse<Notice>;
export type NoticeRetryResponse = ApiSuccessResponse<{
  emailStats?: NoticeEmailStats;
  failed?: number;
  queued?: number;
}>;

export type NoticeQuery = {
  limit?: number;
  page?: number;
  status?: string;
  targetType?: string;
};

function getAudienceBasePath(audience: NoticeAudience) {
  return audience === "investee" ? "investee/notices" : "investor/notices";
}

export function getAudienceNotices(audience: NoticeAudience, params: NoticeQuery = {}) {
  return apiRequest<NoticeListResponse>({
    method: "GET",
    params,
    url: getAudienceBasePath(audience),
  });
}

export function getAudienceNotice(audience: NoticeAudience, noticeId: string) {
  return apiRequest<NoticeResponse>({
    method: "GET",
    url: `${getAudienceBasePath(audience)}/${noticeId}`,
  });
}

export function markAudienceNoticeAsRead(audience: NoticeAudience, noticeId: string) {
  return apiRequest<NoticeResponse>({
    method: "PATCH",
    url: `${getAudienceBasePath(audience)}/${noticeId}/read`,
  });
}

export function getSuperadminNotices(params: NoticeQuery = {}) {
  return apiRequest<NoticeListResponse>({
    method: "GET",
    params,
    url: "super-admin/notices",
  });
}

export function getSuperadminNotice(noticeId: string) {
  return apiRequest<NoticeResponse>({
    method: "GET",
    url: `super-admin/notices/${noticeId}`,
  });
}

export function createSuperadminNotice(payload: {
  image?: File | null;
  message: string;
  targetType: NoticeTargetType;
  title: string;
}) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("message", payload.message);
  formData.append("targetType", payload.targetType);

  if (payload.image) {
    formData.append("image", payload.image);
  }

  return apiRequest<NoticeResponse>({
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    method: "POST",
    url: "super-admin/notices",
  });
}

export function updateSuperadminNotice(noticeId: string, payload: {
  message: string;
  title: string;
}) {
  return apiRequest<NoticeResponse>({
    data: payload,
    method: "PATCH",
    url: `super-admin/notices/${noticeId}`,
  });
}

export function uploadNoticeEditorImage(image: File) {
  const formData = new FormData();
  formData.append("image", image);

  return apiRequest<ApiSuccessResponse<NoticeImage>>({
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    method: "POST",
    url: "super-admin/notices/images",
  });
}

export function deleteNoticeEditorImage(key: string) {
  return apiRequest<ApiSuccessResponse<{ key: string }>>({
    data: { key },
    method: "DELETE",
    url: "super-admin/notices/images",
  });
}

export function archiveSuperadminNotice(noticeId: string) {
  return apiRequest<NoticeResponse>({
    method: "PATCH",
    url: `super-admin/notices/${noticeId}/archive`,
  });
}

export function deleteSuperadminNotice(noticeId: string) {
  return apiRequest<ApiSuccessResponse<{ id: string }>>({
    method: "DELETE",
    url: `super-admin/notices/${noticeId}`,
  });
}

export function retryFailedNoticeEmails(noticeId: string) {
  return apiRequest<NoticeRetryResponse>({
    method: "POST",
    url: `super-admin/notices/${noticeId}/retry-failed-emails`,
  });
}
