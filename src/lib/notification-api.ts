import { apiRequest } from "./api";

export type NotificationItem = {
  _id: string;
  createdAt?: string;
  isRead?: boolean;
  message: string;
  metadata?: Record<string, unknown>;
  readAt?: string | null;
  referenceId?: string | null;
  referenceType?: string;
  title: string;
  type: string;
  updatedAt?: string;
};

type NotificationsResponse = {
  data: NotificationItem[];
  pagination?: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
  readCount?: number;
  success?: boolean;
  totalCount?: number;
  unreadCount?: number;
};

type UnreadCountResponse = {
  data: {
    unreadCount: number;
  };
  success?: boolean;
};

type NotificationQuery = {
  limit?: number;
  page?: number;
  read?: boolean;
  unread?: boolean;
};

export async function getNotifications({
  limit = 50,
  page = 1,
  read,
  unread,
}: NotificationQuery = {}) {
  return apiRequest<NotificationsResponse>({
    method: "GET",
    url: "notifications",
    params: {
      limit,
      page,
      ...(read ? { read: "true" } : {}),
      ...(unread ? { unread: "true" } : {}),
    },
  });
}

export async function getNotificationTabs() {
  const [unreadResponse, readResponse] = await Promise.all([
    getNotifications({ unread: true }),
    getNotifications({ read: true }),
  ]);

  const unreadData = unreadResponse.data ?? [];
  const readData = readResponse.data ?? [];

  return {
    data: [...unreadData, ...readData],
    readCount: readResponse.readCount ?? readResponse.pagination?.total ?? readData.length,
    unreadCount: unreadResponse.unreadCount ?? unreadResponse.pagination?.total ?? unreadData.length,
  };
}

export async function getUnreadNotificationCount() {
  return apiRequest<UnreadCountResponse>({
    method: "GET",
    url: "notifications/unread-count",
  });
}

export async function markNotificationAsRead(notificationId: string) {
  return apiRequest<{ data: NotificationItem; success?: boolean }>({
    method: "PATCH",
    url: `notifications/${notificationId}/read`,
  });
}

export async function markAllNotificationsAsRead() {
  return apiRequest<{ data: { modifiedCount: number }; success?: boolean }>({
    method: "PATCH",
    url: "notifications/mark-all-read",
  });
}
