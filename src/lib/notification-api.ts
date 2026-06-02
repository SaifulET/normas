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
  success?: boolean;
  unreadCount?: number;
};

type UnreadCountResponse = {
  data: {
    unreadCount: number;
  };
  success?: boolean;
};

export async function getNotifications() {
  const firstPage = await apiRequest<NotificationsResponse>({
    method: "GET",
    url: "notifications",
    params: {
      limit: 100,
      page: 1,
    },
  });
  const totalPages = firstPage.pagination?.totalPages ?? 1;

  if (totalPages <= 1) {
    return firstPage;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      apiRequest<NotificationsResponse>({
        method: "GET",
        url: "notifications",
        params: {
          limit: 100,
          page: index + 2,
        },
      }),
    ),
  );

  return {
    ...firstPage,
    data: [
      ...(firstPage.data ?? []),
      ...remainingPages.flatMap((page) => page.data ?? []),
    ],
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
