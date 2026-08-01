"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import {
  getAudienceNotice,
  getAudienceNotices,
  markAudienceNoticeAsRead,
  type Notice,
  type NoticeAudience,
} from "@/lib/notice-api";
import { DashboardIcon } from "./icons";
import { DashboardPageHeader } from "./page-header";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatDate(value?: string) {
  if (!value) {
    return "Not published";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not published";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function sanitizeNoticeHtml(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|iframe|object|embed|link|meta|style)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|iframe|object|embed|link|meta|style)\b[^>]*\/?>/gi, "")
    .replace(/\s(?:on[a-z]+)\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi, "");
}

function stripNoticeHtml(html: string) {
  if (typeof window === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  const element = document.createElement("div");
  element.innerHTML = sanitizeNoticeHtml(html);
  return element.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function getDashboardBase(pathname: string) {
  return pathname.startsWith("/investee-dashboard") ? "/investee-dashboard" : "/dashboard";
}

function getTargetLabel(targetType: Notice["targetType"]) {
  if (targetType === "all") {
    return "All users";
  }

  return targetType === "investee" ? "Investees" : "Investors";
}

function NoticeImagePreview({ notice }: { notice: Notice }) {
  if (!notice.image?.url) {
    return (
      <div className="flex aspect-[16/9] min-h-[180px] items-center justify-center bg-[#EEF3F8] text-[#91A0B4]">
        <DashboardIcon name="notice" className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] min-h-[180px] overflow-hidden bg-[#EEF3F8]">
      <img
        src={notice.image.url}
        alt=""
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export function DashboardNoticePage({ audience }: { audience: NoticeAudience }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const pathname = usePathname();
  const baseHref = getDashboardBase(pathname);
  const unreadCount = useMemo(() => notices.filter((notice) => !notice.isRead).length, [notices]);

  useEffect(() => {
    let active = true;

    async function loadNotices() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getAudienceNotices(audience, { limit: 50 });

        if (active) {
          setNotices(response.data.notices ?? []);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(getApiErrorMessage(error, "Unable to load notices."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadNotices();

    return () => {
      active = false;
    };
  }, [audience]);

  const handleMarkRead = async (noticeId: string) => {
    setNotices((items) => items.map((notice) => (notice._id === noticeId ? { ...notice, isRead: true } : notice)));

    try {
      await markAudienceNoticeAsRead(audience, noticeId);
    } catch {
      setNotices((items) => items.map((notice) => (notice._id === noticeId ? { ...notice, isRead: false } : notice)));
    }
  };

  const handleOpenNotice = (noticeId: string) => {
    void handleMarkRead(noticeId);
    router.push(`${baseHref}/notices/${noticeId}`);
  };

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        title="Notices"
        subtitle="Platform updates and admin announcements for your account."
      >
        <div className="rounded-[10px] border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#314B6B]">
          {unreadCount} unread
        </div>
      </DashboardPageHeader>

      {errorMessage ? (
        <div className="rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
          {errorMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[18px] border border-[#E6EBF3] bg-white px-5 py-12 text-center text-sm text-[#667085]">
          Loading notices...
        </div>
      ) : notices.length === 0 ? (
        <div className="rounded-[18px] border border-[#E6EBF3] bg-white px-5 py-12 text-center">
          <h2 className="text-lg font-semibold text-[#1E2746]">No notices yet</h2>
          <p className="mt-2 text-sm text-[#667085]">Admin notices will appear here when published.</p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-[18px] border border-[#E6EBF3] bg-white shadow-[0_24px_80px_-64px_rgba(30,39,70,0.45)]">
          <div className="flex items-center justify-between gap-4 border-b border-[#EEF2F7] px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1E2746]">All notices</h2>
              <p className="mt-1 text-sm text-[#667085]">Click a notice row to view details.</p>
            </div>
            <span className="rounded-full bg-[#F3F6FA] px-3 py-1 text-xs font-semibold text-[#53627A]">
              {notices.length} total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full text-left">
              <thead className="bg-[#FBFCFE] text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">
                <tr>
                  <th className="px-5 py-4">Notice</th>
                  <th className="px-5 py-4">Audience</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Published</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F6] text-sm">
                {notices.map((notice) => (
                  <tr
                    key={notice._id}
                    onClick={() => handleOpenNotice(notice._id)}
                    className="cursor-pointer transition hover:bg-[#F8FAFC]"
                  >
                    <td className="max-w-[460px] px-5 py-4">
                      <p className="line-clamp-1 font-semibold text-[#1E2746]">{notice.title}</p>
                      <p className="mt-1 line-clamp-1 text-xs leading-5 text-[#667085]">
                        {stripNoticeHtml(notice.message)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-[#53627A]">{getTargetLabel(notice.targetType)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={cx(
                          "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                          notice.isRead ? "bg-[#F2F4F7] text-[#667085]" : "bg-[#ECFDF3] text-[#027A48]",
                        )}
                      >
                        {notice.isRead ? "Read" : "New"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#667085]">{formatDate(notice.publishedAt || notice.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`${baseHref}/notices/${notice._id}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleMarkRead(notice._id);
                        }}
                        className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#DDE4EF] px-3 text-xs font-semibold text-[#314B6B] transition hover:bg-[#F8FAFC]"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </section>
  );
}

export function DashboardNoticeDetailPage({
  audience,
  noticeId,
}: {
  audience: NoticeAudience;
  noticeId: string;
}) {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);
  const pathname = usePathname();
  const baseHref = getDashboardBase(pathname);

  useEffect(() => {
    let active = true;

    async function loadNotice() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getAudienceNotice(audience, noticeId);

        if (active) {
          setNotice(response.data);
        }

        await markAudienceNoticeAsRead(audience, noticeId);
      } catch (error) {
        if (active) {
          setErrorMessage(getApiErrorMessage(error, "Unable to load this notice."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadNotice();

    return () => {
      active = false;
    };
  }, [audience, noticeId]);

  if (loading) {
    return (
      <section className="rounded-[18px] border border-[#E6EBF3] bg-white px-5 py-12 text-center text-sm text-[#667085]">
        Loading notice...
      </section>
    );
  }

  if (errorMessage || !notice) {
    return (
      <section className="space-y-5">
        <Link href={`${baseHref}/notices`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#314B6B]">
          <DashboardIcon name="chevronLeft" className="h-4 w-4" />
          Back to notices
        </Link>
        <div className="rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
          {errorMessage || "Notice not found."}
        </div>
      </section>
    );
  }

  return (
    <article className="mx-auto max-w-4xl space-y-6">
      <Link href={`${baseHref}/notices`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#314B6B]">
        <DashboardIcon name="chevronLeft" className="h-4 w-4" />
        Back to notices
      </Link>

      <div className="overflow-hidden rounded-[18px] border border-[#E6EBF3] bg-white shadow-[0_24px_80px_-60px_rgba(30,39,70,0.45)]">
        <NoticeImagePreview notice={notice} />
        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-[#ECFDF3] px-3 py-1 text-xs font-semibold text-[#027A48]">
              {getTargetLabel(notice.targetType)}
            </span>
            <span className="text-xs font-medium text-[#98A2B3]">{formatDate(notice.publishedAt || notice.createdAt)}</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#1E2746]">{notice.title}</h1>
          <div
            className="notice-rich-content"
            dangerouslySetInnerHTML={{ __html: sanitizeNoticeHtml(notice.message) }}
          />
        </div>
      </div>

      <style jsx global>{`
        .notice-rich-content {
          color: #53627a;
          font-size: 14px;
          line-height: 1.8;
        }

        .notice-rich-content h1,
        .notice-rich-content h2,
        .notice-rich-content h3 {
          color: #1e2746;
          font-weight: 700;
          line-height: 1.25;
          margin: 18px 0 10px;
        }

        .notice-rich-content h1 {
          font-size: 30px;
        }

        .notice-rich-content h2 {
          font-size: 24px;
        }

        .notice-rich-content h3 {
          font-size: 20px;
        }

        .notice-rich-content p,
        .notice-rich-content ul,
        .notice-rich-content ol,
        .notice-rich-content blockquote {
          margin: 12px 0;
        }

        .notice-rich-content ul,
        .notice-rich-content ol {
          padding-left: 24px;
        }

        .notice-rich-content a {
          color: #314b6b;
          font-weight: 600;
          text-decoration: underline;
        }

        .notice-rich-content img {
          max-width: 100%;
          border-radius: 12px;
          margin: 16px 0;
        }
      `}</style>
    </article>
  );
}
