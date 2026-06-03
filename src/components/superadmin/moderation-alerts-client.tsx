"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import {
  approveModerationPost,
  deleteModerationPost,
  getModerationAlerts,
  keepModerationPostSuspended,
  markModerationAlertReviewed,
  suspendModerationUser,
  type ModerationAlert,
  warnModerationUser,
} from "@/lib/moderation-api";
import { SuperadminPageHeader, SuperadminStatusBadge } from "./shell";

type AlertFilter = "pending" | "reviewed" | "all";

const PAGE_LIMIT = 8;

function formatDate(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function humanize(value?: string) {
  return (value || "alert").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPrimaryUser(alert: ModerationAlert) {
  return alert.sender ?? alert.user ?? null;
}

function getSecondaryUser(alert: ModerationAlert) {
  return alert.receiver ?? null;
}

function canActOnPost(alert: ModerationAlert) {
  return Boolean(alert.list?._id);
}

export function ModerationAlertsClient() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<ModerationAlert[]>([]);
  const [filter, setFilter] = useState<AlertFilter>("pending");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    limit: PAGE_LIMIT,
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [note, setNote] = useState("");

  const filteredStatus = filter === "all" ? undefined : filter;

  const counts = useMemo(() => ({
    total: pagination.total,
    pending: pendingCount,
  }), [pagination.total, pendingCount]);

  const pageStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const pageEnd = Math.min(pagination.page * pagination.limit, pagination.total);

  const loadAlerts = async () => {
    setLoading(true);

    try {
      const response = await getModerationAlerts({
        limit: PAGE_LIMIT,
        page,
        status: filteredStatus,
      });

      startTransition(() => {
        setAlerts(response.data.alerts ?? []);
        setPagination({
          limit: response.data.pagination?.limit ?? PAGE_LIMIT,
          page: response.data.pagination?.page ?? page,
          total: response.data.pagination?.total ?? response.data.alerts?.length ?? 0,
          totalPages: response.data.pagination?.totalPages ?? 1,
        });
        setPendingCount(response.data.pendingCount ?? 0);
        setError("");
      });
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load moderation alerts."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredStatus, page]);

  const runAction = async (alertId: string, action: (id: string, note?: string) => Promise<unknown>) => {
    if (savingId) {
      return;
    }

    setSavingId(alertId);
    setError("");

    try {
      await action(alertId, note.trim() || undefined);
      setNote("");
      await loadAlerts();
    } catch (actionError) {
      setError(getApiErrorMessage(actionError, "Unable to update moderation alert."));
    } finally {
      setSavingId("");
    }
  };

  const openAlertDetails = (alertId: string) => {
    router.push(`/superadmin/dashboard/moderation/${alertId}`);
  };

  return (
    <div className="space-y-6">
      <SuperadminPageHeader
        title="Moderation"
        subtitle="Review AI moderation alerts and decide final actions"
        actionArea={
          <div className="flex items-center gap-2 rounded-[10px] bg-white px-3 py-2 text-xs text-[#4B5563]">
            <span>{counts.pending} pending</span>
            <span className="text-[#CBD5E1]">/</span>
            <span>{counts.total} loaded</span>
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-[10px] border border-[#E3E7EF] bg-white p-1">
          {(["pending", "reviewed", "all"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setPage(1);
                setFilter(item);
              }}
              className={`h-9 rounded-[8px] px-4 text-xs font-medium transition ${
                filter === item ? "bg-[#2B425D] text-white" : "text-[#5B6477] hover:bg-[#F4F6FA]"
              }`}
            >
              {humanize(item)}
            </button>
          ))}
        </div>

        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="h-10 w-full max-w-[360px] rounded-[10px] border border-[#DDE3ED] bg-white px-3 text-sm text-[#20243A] outline-none focus:border-[#314B6B]"
          placeholder="Optional review note"
        />
      </div>

      {error ? (
        <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[14px] border border-[#E6E9F0] bg-white">
        <div className="grid grid-cols-[1.1fr_1.2fr_1fr_1fr_260px] gap-4 border-b border-[#EEF1F6] px-5 py-3 text-[11px] uppercase tracking-[0.12em] text-[#8A91AB]">
          <p>Alert</p>
          <p>Content</p>
          <p>People</p>
          <p>Reason</p>
          <p className="text-center">Actions</p>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-[#667085]">Loading moderation alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[#667085]">No alerts in this view.</div>
        ) : (
          alerts.map((alert) => {
            const primaryUser = getPrimaryUser(alert);
            const secondaryUser = getSecondaryUser(alert);
            const postHref = alert.list?._id ? `/superadmin/dashboard/pitch/${alert.list._id}` : "";
            const disabled = savingId === alert._id;

            return (
              <div
                key={alert._id}
                role="button"
                tabIndex={0}
                onClick={() => openAlertDetails(alert._id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openAlertDetails(alert._id);
                  }
                }}
                className="grid cursor-pointer grid-cols-[1.1fr_1.2fr_1fr_1fr_260px] gap-4 border-b border-[#F3F5F9] px-5 py-4 transition hover:bg-[#F8FAFC] focus:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#314B6B]/20 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <SuperadminStatusBadge status={alert.status || "pending"} />
                    <span className="text-xs text-[#8A91AB]">{formatDate(alert.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[#202350]">{humanize(alert.type)}</p>
                  <p className="mt-1 text-xs text-[#69729A]">{humanize(alert.decision)}</p>
                  <Link
                    href={`/superadmin/dashboard/moderation/${alert._id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="mt-2 inline-flex text-xs font-semibold text-[#314B6B]"
                  >
                    View details
                  </Link>
                </div>

                <div className="min-w-0">
                  {alert.list ? (
                    <>
                      <p className="truncate text-sm font-semibold text-[#202350]">{alert.list.title || "Untitled pitch"}</p>
                      <p className="mt-1 text-xs text-[#69729A]">{alert.list.sector || "No sector"} / {alert.list.stage || "No stage"}</p>
                      {postHref ? (
                        <Link
                          href={postHref}
                          onClick={(event) => event.stopPropagation()}
                          className="mt-2 inline-flex text-xs font-semibold text-[#314B6B]"
                        >
                          Review post
                        </Link>
                      ) : null}
                    </>
                  ) : (
                    <p className="line-clamp-4 whitespace-pre-wrap break-words text-sm leading-5 text-[#3F4863]">
                      {alert.message || "No message body"}
                    </p>
                  )}
                </div>

                <div className="min-w-0 text-xs text-[#5F6786]">
                  <p className="truncate font-medium text-[#202350]">{primaryUser?.name || "Unknown sender"}</p>
                  <p className="truncate">{primaryUser?.email || ""}</p>
                  {secondaryUser ? (
                    <p className="mt-2 truncate">To: {secondaryUser.name || secondaryUser.email}</p>
                  ) : null}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap gap-1.5">
                    {(alert.detectedReasons ?? []).slice(0, 4).map((reason) => (
                      <span key={reason} className="rounded-full bg-[#FFF2E5] px-2 py-1 text-[10px] font-medium text-[#B45309]">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mx-auto w-full max-w-[240px] space-y-2" onClick={(event) => event.stopPropagation()}>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/superadmin/dashboard/moderation/${alert._id}`}
                      className="inline-flex h-8 items-center justify-center rounded-[8px] border border-[#DDE3ED] px-3 text-xs font-semibold text-[#314B6B] transition hover:bg-[#F8FAFC]"
                    >
                      Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => void runAction(alert._id, markModerationAlertReviewed)}
                      disabled={disabled}
                      className="inline-flex h-8 items-center justify-center rounded-[8px] bg-[#2B425D] px-3 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      Reviewed
                    </button>
                  </div>

                  {canActOnPost(alert) ? (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => void runAction(alert._id, approveModerationPost)}
                        disabled={disabled}
                        className="inline-flex h-8 items-center justify-center rounded-[8px] bg-[#D6F8E3] px-2 text-xs font-semibold text-[#0F7A49] disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => void runAction(alert._id, keepModerationPostSuspended)}
                        disabled={disabled}
                        className="inline-flex h-8 items-center justify-center rounded-[8px] bg-[#FFF2E5] px-2 text-xs font-semibold text-[#B45309] disabled:opacity-60"
                      >
                        Suspend
                      </button>
                      <button
                        type="button"
                        onClick={() => void runAction(alert._id, deleteModerationPost)}
                        disabled={disabled}
                        className="inline-flex h-8 items-center justify-center rounded-[8px] bg-[#FEE2E2] px-2 text-xs font-semibold text-[#B42318] disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => void runAction(alert._id, warnModerationUser)}
                      disabled={disabled}
                      className="inline-flex h-8 items-center justify-center rounded-[8px] border border-[#DDE3ED] px-3 text-xs font-semibold text-[#525B79] disabled:opacity-60"
                    >
                      Warn user
                    </button>
                    <button
                      type="button"
                      onClick={() => void runAction(alert._id, suspendModerationUser)}
                      disabled={disabled}
                      className="inline-flex h-8 items-center justify-center rounded-[8px] border border-[#FECACA] px-3 text-xs font-semibold text-[#B42318] disabled:opacity-60"
                    >
                      Suspend user
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {!loading && alerts.length > 0 ? (
          <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-3 text-[10px] text-[#727A96]">
            <p>
              Showing {pageStart}-{pageEnd} of {pagination.total} alerts
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className={`inline-flex h-7 min-w-7 items-center justify-center rounded-[8px] border border-[#E4E8F0] px-2 ${
                  pagination.page <= 1 || loading ? "text-[#C2C8D6]" : "text-[#4A5271] hover:bg-[#F7F8FC]"
                }`}
              >
                Prev
              </button>
              <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-[8px] border border-[#CFD5E3] bg-white px-2 text-[#4A5271]">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                className={`inline-flex h-7 min-w-7 items-center justify-center rounded-[8px] border border-[#E4E8F0] px-2 ${
                  pagination.page >= pagination.totalPages || loading ? "text-[#C2C8D6]" : "text-[#4A5271] hover:bg-[#F7F8FC]"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
