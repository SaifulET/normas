"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { API_BASE_URL, getApiErrorMessage } from "@/lib/api";
import { getStoredAccessToken } from "@/lib/auth-storage";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from "@/lib/notification-api";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getSocketUrl() {
  return API_BASE_URL.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
}

function formatNotificationTime(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function sortNotifications(items: NotificationItem[]) {
  return [...items].sort((first, second) => {
    const firstTime = new Date(first.createdAt || 0).getTime();
    const secondTime = new Date(second.createdAt || 0).getTime();
    return secondTime - firstTime;
  });
}

function isRead(notification: NotificationItem) {
  return Boolean(notification.readAt || notification.isRead);
}

function getMetadataString(notification: NotificationItem, key: string) {
  const value = notification.metadata?.[key];
  return typeof value === "string" ? value : "";
}

function getReferenceId(notification: NotificationItem) {
  if (typeof notification.referenceId === "string") {
    return notification.referenceId;
  }

  return (
    getMetadataString(notification, "scheduleId") ||
    getMetadataString(notification, "invoiceId") ||
    getMetadataString(notification, "listId") ||
    getMetadataString(notification, "reportId") ||
    getMetadataString(notification, "userId") ||
    getMetadataString(notification, "alertId")
  );
}

function getNotificationHref(notification: NotificationItem, pathname: string) {
  const referenceId = getReferenceId(notification);

  if (!referenceId) {
    return "";
  }

  const referenceType = notification.referenceType || "";
  const isSuperadmin = pathname.startsWith("/superadmin");
  const isInvestee = pathname.startsWith("/investee-dashboard");
  const dashboardPrefix = isSuperadmin
    ? "/superadmin/dashboard"
    : isInvestee
      ? "/investee-dashboard"
      : "/dashboard";

  if (referenceType === "schedule") {
    return `${dashboardPrefix}/schedule?scheduleId=${encodeURIComponent(referenceId)}`;
  }

  if (referenceType === "list") {
    if (isInvestee) {
      return `/investee-dashboard/created-list/${encodeURIComponent(referenceId)}`;
    }

    if (!isSuperadmin && getMetadataString(notification, "action") === "restore") {
      return `/pitch/${encodeURIComponent(referenceId)}`;
    }

    return isSuperadmin ? "/superadmin/dashboard" : dashboardPrefix;
  }

  if (isSuperadmin && referenceType === "payment") {
    return `/superadmin/dashboard/payment-management/${encodeURIComponent(referenceId)}`;
  }

  if (isSuperadmin && referenceType === "report") {
    return `/superadmin/dashboard/reports/${encodeURIComponent(referenceId)}`;
  }

  if (isSuperadmin && referenceType === "user") {
    return `/superadmin/dashboard/user-management/${encodeURIComponent(referenceId)}`;
  }

  if (isSuperadmin && referenceType === "moderation_alert") {
    return `/superadmin/dashboard/moderation/${encodeURIComponent(referenceId)}`;
  }

  if (referenceType === "report") {
    const listId = getMetadataString(notification, "listId");

    if (isInvestee && listId) {
      return `/investee-dashboard/created-list/${encodeURIComponent(listId)}`;
    }

    if (listId && getMetadataString(notification, "action") === "restore") {
      return `/pitch/${encodeURIComponent(listId)}`;
    }

    return dashboardPrefix;
  }

  return "";
}

function NotificationList({
  emptyLabel,
  items,
  onActivate,
}: {
  emptyLabel: string;
  items: NotificationItem[];
  onActivate: (notification: NotificationItem) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[92px] items-center justify-center rounded-[8px] border border-dashed border-[#DDE4EF] bg-[#F8FAFC] px-4 text-center text-xs text-[#7B8499]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100dvh-260px)] space-y-2 overflow-y-auto pr-1 sm:max-h-[260px]">
      {items.map((notification) => {
        const read = isRead(notification);

        return (
          <button
            key={notification._id}
            type="button"
            onClick={() => onActivate(notification)}
            className={cx(
              "w-full rounded-[8px] border px-3 py-3 text-left transition",
              read
                ? "border-[#E7ECF3] bg-white hover:bg-[#F8FAFC]"
                : "border-[#D7E4F5] bg-[#F4F8FD] hover:bg-[#EEF5FC]",
            )}
          >
            <div className="flex items-start gap-2">
              <span
                className={cx(
                  "mt-1 h-2 w-2 shrink-0 rounded-full",
                  read ? "bg-[#D6DCE8]" : "bg-[#EF4444]",
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-5 text-[#1E2746]">
                  {notification.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#667085]">
                  {notification.message}
                </span>
                <span className="mt-2 block text-[11px] font-medium text-[#98A2B3]">
                  {formatNotificationTime(notification.createdAt)}
                </span>
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function NotificationDropdown({
  className,
  iconClassName,
  variant = "dashboard",
}: {
  className?: string;
  iconClassName?: string;
  variant?: "dashboard" | "superadmin";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const unreadNotifications = useMemo(
    () => sortNotifications(notifications.filter((notification) => !isRead(notification))),
    [notifications],
  );
  const readNotifications = useMemo(
    () => sortNotifications(notifications.filter((notification) => isRead(notification))),
    [notifications],
  );
  const unreadCount = unreadNotifications.length;
  const currentItems = activeTab === "unread" ? unreadNotifications : readNotifications;

  const loadNotifications = async () => {
    try {
      setErrorMessage("");
      const response = await getNotifications();
      setNotifications(sortNotifications(response.data ?? []));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Notifications could not be loaded"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  useEffect(() => {
    const token = getStoredAccessToken();

    if (!token) {
      return;
    }

    const socket = io(getSocketUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    socket.emit("notification:join", { token });
    socket.on("notification:new", (notification: NotificationItem) => {
      setNotifications((items) => {
        const withoutDuplicate = items.filter((item) => item._id !== notification._id);
        return sortNotifications([notification, ...withoutDuplicate]);
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  const handleActivateNotification = async (notification: NotificationItem) => {
    const href = getNotificationHref(notification, pathname);

    if (isRead(notification)) {
      if (href) {
        setOpen(false);
        router.push(href);
      }

      return;
    }

    setNotifications((items) =>
      items.map((item) =>
        item._id === notification._id
          ? { ...item, isRead: true, readAt: new Date().toISOString() }
          : item,
      ),
    );

    try {
      const response = await markNotificationAsRead(notification._id);
      setNotifications((items) =>
        items.map((item) => (item._id === notification._id ? response.data : item)),
      );
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Notification could not be updated"));
      void loadNotifications();
    }

    if (href) {
      setOpen(false);
      router.push(href);
    }
  };

  const handleMarkAllRead = async () => {
    const readAt = new Date().toISOString();

    setNotifications((items) =>
      items.map((item) => (isRead(item) ? item : { ...item, isRead: true, readAt })),
    );

    try {
      await markAllNotificationsAsRead();
      setActiveTab("read");
      void loadNotifications();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Notifications could not be updated"));
      void loadNotifications();
    }
  };

  const buttonClassName =
    className ??
    (variant === "superadmin"
      ? "relative inline-flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#E2E4ED] bg-white text-[#4D5572]"
      : "relative inline-flex items-center justify-center rounded-[8px] border border-[#E5EAF2] bg-white p-[13px] text-[#314B6B] shadow-[0_14px_35px_-28px_rgba(36,59,90,0.55)]");

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={buttonClassName}
        aria-expanded={open}
        aria-label="Notifications"
      >
        <Image
          src="/notification-01.svg"
          alt=""
          width={20}
          height={20}
          aria-hidden="true"
          className={iconClassName}
        />
        {unreadCount > 0 ? (
          <span className="absolute right-[7px] top-[7px] flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-semibold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed left-3 right-3 top-[76px] z-50 max-h-[calc(100dvh-92px)] overflow-hidden rounded-[8px] border border-[#E2E8F0] bg-white p-3 text-[#1E2746] shadow-[0_24px_80px_-44px_rgba(15,23,42,0.55)] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-[min(360px,calc(100vw-32px))] sm:max-h-none">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#1E2746]">Notifications</p>
              <p className="mt-0.5 text-[11px] text-[#7B8499]">{unreadCount} unread</p>
            </div>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="rounded-[6px] border border-[#DDE4EF] px-2.5 py-1.5 text-[11px] font-semibold text-[#314B6B] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Mark all read
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 rounded-[8px] bg-[#F3F6FA] p-1">
            {(["unread", "read"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cx(
                  "rounded-[6px] px-3 py-2 text-xs font-semibold capitalize transition",
                  activeTab === tab ? "bg-white text-[#1E2746] shadow-sm" : "text-[#7B8499]",
                )}
              >
                {tab === "unread" ? `Unread (${unreadNotifications.length})` : `Read (${readNotifications.length})`}
              </button>
            ))}
          </div>

          <div className="mt-3">
            {loading ? (
              <div className="flex min-h-[140px] items-center justify-center rounded-[8px] bg-[#F8FAFC] text-xs text-[#7B8499]">
                Loading...
              </div>
            ) : (
              <NotificationList
                emptyLabel={activeTab === "unread" ? "No unread notifications" : "No read notifications"}
                items={currentItems}
                onActivate={handleActivateNotification}
              />
            )}
          </div>

          {errorMessage ? (
            <p className="mt-3 rounded-[6px] bg-[#FEF2F2] px-3 py-2 text-xs text-[#B42318]">
              {errorMessage}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
