"use client";

import { useCallback, useEffect, useState } from "react";
import { Delete02Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  getBlockedIps,
  unblockIp,
  type AdminBlockedIp,
  type AdminBlockedIpsPagination,
} from "@/lib/admin-blocked-ips-api";
import { getApiErrorMessage } from "@/lib/api";
import { SuperadminPageHeader } from "./shell";

const PAGE_LIMIT = 8;

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatDate(value?: string) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function SuperadminIpBlockClient() {
  const [blockedIps, setBlockedIps] = useState<AdminBlockedIp[]>([]);
  const [pagination, setPagination] = useState<AdminBlockedIpsPagination>({
    limit: PAGE_LIMIT,
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unblockTarget, setUnblockTarget] = useState<AdminBlockedIp | null>(null);
  const [unblockingId, setUnblockingId] = useState("");

  const loadBlockedIps = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError("");

    try {
      const response = await getBlockedIps({
        limit: PAGE_LIMIT,
        page: targetPage,
        search: debouncedSearch || undefined,
      });

      const nextBlockedIps = response.data.blockedIps ?? [];
      const nextPagination = response.data.pagination ?? {
        limit: PAGE_LIMIT,
        page: targetPage,
        total: nextBlockedIps.length,
        totalPages: 1,
      };

      if (nextBlockedIps.length === 0 && nextPagination.page > 1) {
        setPage(nextPagination.page - 1);
        return;
      }

      setBlockedIps(nextBlockedIps);
      setPagination(nextPagination);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to load blocked IPs."));
      setBlockedIps([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = search.trim();

      if (nextSearch !== debouncedSearch) {
        setDebouncedSearch(nextSearch);
        setPage(1);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [debouncedSearch, search]);

  useEffect(() => {
    void loadBlockedIps(page);
  }, [loadBlockedIps, page]);

  const handleUnblockIp = async () => {
    if (!unblockTarget) {
      return;
    }

    setUnblockingId(unblockTarget.id);
    setError("");

    try {
      await unblockIp(unblockTarget.id);
      setUnblockTarget(null);
      await loadBlockedIps(page);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to unblock this IP."));
    } finally {
      setUnblockingId("");
    }
  };

  const pageStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const pageEnd = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-6">
      <SuperadminPageHeader title="IP Block" subtitle="IPs blocked after sending more than 7 support messages" />

      <div className="flex justify-end">
        <label className="flex h-9 min-w-[246px] items-center gap-2 rounded-full border border-[#E3E6EF] bg-white px-3 text-[#8C93A8]">
          <HugeiconsIcon icon={Search01Icon} className="h-4 w-4" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search blocked IP"
            className="w-full border-0 bg-transparent text-[12px] text-[#20243A] outline-none placeholder:text-[#9AA1B6]"
          />
        </label>
      </div>

      {error ? (
        <div className="rounded-[10px] border border-[#F4C7C7] bg-[#FFF5F5] px-4 py-3 text-[13px] text-[#B42318]">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[14px] border border-[#E6E9F0] bg-white">
        <div className="overflow-x-auto">
          <div className="grid min-w-[860px] grid-cols-[1.2fr_0.7fr_1.4fr_1fr_96px] gap-4 border-b border-[#EEF1F6] px-6 py-4 text-[11px] text-[#8A91AB]">
            <p>IP Address</p>
            <p>Messages</p>
            <p>Reason</p>
            <p>Blocked Date</p>
            <p className="text-right">Actions</p>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-center text-[13px] text-[#69729A]">Loading blocked IPs...</div>
          ) : blockedIps.length === 0 ? (
            <div className="px-6 py-8 text-center text-[13px] text-[#69729A]">No blocked IPs found.</div>
          ) : (
            blockedIps.map((record) => (
              <div
                key={record.id}
                className="grid min-w-[860px] grid-cols-[1.2fr_0.7fr_1.4fr_1fr_96px] gap-4 border-b border-[#F3F5F9] px-6 py-3 last:border-b-0"
              >
                <p className="text-[13px] font-medium text-[#202350]">{record.ip}</p>
                <p className="text-[13px] text-[#34395B]">{record.messageCount ?? 0}</p>
                <p className="text-[13px] text-[#34395B]">{record.reason || "Exceeded 7 support messages"}</p>
                <p className="text-[13px] text-[#34395B]">{formatDate(record.blockedAt)}</p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setUnblockTarget(record)}
                    disabled={unblockingId === record.id}
                    className="inline-flex h-8 items-center justify-center rounded-[8px] border border-[#F4C7C7] bg-white px-3 text-[12px] font-semibold text-[#B42318] transition hover:bg-[#FFF5F5] disabled:cursor-wait disabled:opacity-60"
                  >
                    Unblock
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-3 text-[10px] text-[#727A96]">
          <p>
            Showing {pageStart}-{pageEnd} of {pagination.total} blocked IPs
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className={cx(
                "inline-flex h-7 min-w-7 items-center justify-center rounded-[8px] border border-[#E4E8F0] px-2",
                pagination.page <= 1 || loading ? "text-[#C2C8D6]" : "text-[#4A5271] hover:bg-[#F7F8FC]",
              )}
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
              className={cx(
                "inline-flex h-7 min-w-7 items-center justify-center rounded-[8px] border border-[#E4E8F0] px-2",
                pagination.page >= pagination.totalPages || loading ? "text-[#C2C8D6]" : "text-[#4A5271] hover:bg-[#F7F8FC]",
              )}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {unblockTarget ? (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-[#0F172A]/35 p-4"
          onClick={() => {
            if (!unblockingId) {
              setUnblockTarget(null);
            }
          }}
        >
          <div
            className="w-full max-w-[360px] rounded-[14px] border border-[#E6E9F0] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#FFF5F5] text-[#B42318]">
                <HugeiconsIcon icon={Delete02Icon} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-[#202350]">Unblock this IP?</h2>
                <p className="mt-1 text-[12px] leading-5 text-[#69729A]">
                  {unblockTarget.ip} will be able to send support messages again.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUnblockTarget(null)}
                disabled={Boolean(unblockingId)}
                className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#DDE2EC] bg-white px-4 text-[12px] font-semibold text-[#4A5271] transition hover:bg-[#F7F8FC] disabled:cursor-wait disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleUnblockIp();
                }}
                disabled={Boolean(unblockingId)}
                className="inline-flex h-9 items-center justify-center rounded-[8px] bg-[#B42318] px-4 text-[12px] font-semibold text-white transition hover:bg-[#991B1B] disabled:cursor-wait disabled:opacity-60"
              >
                {unblockingId ? "Unblocking..." : "Unblock"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
