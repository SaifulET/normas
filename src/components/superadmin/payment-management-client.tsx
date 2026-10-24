"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Delete02Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  deleteAdminPayment,
  getAdminPayment,
  getAdminPayments,
  type AdminPaymentRecord,
  type AdminPaymentsPagination,
} from "@/lib/admin-payments-api";
import { getApiErrorMessage } from "@/lib/api";
import { SuperadminAvatar, SuperadminBackLink, SuperadminNotificationButton, SuperadminPageHeader, SuperadminStatusBadge } from "./shell";
import { SuperadminPaymentActionMenu } from "./user-action-menu";

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
  }).format(date);
}

function formatAmount(amount?: number, currency?: string) {
  const safeAmount = Number(amount) || 0;
  const safeCurrency = (currency || "usd").toUpperCase();

  try {
    return new Intl.NumberFormat("en-US", {
      currency: safeCurrency,
      style: "currency",
    }).format(safeAmount);
  } catch {
    return `$${safeAmount.toFixed(2)}`;
  }
}

function getInitials(name?: string, email?: string) {
  const source = name?.trim() || email?.split("@")[0] || "User";

  return source
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getGradientSeed(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }

  const palettes = [
    ["#5B8DEF", "#34C759"],
    ["#EF7A1A", "#7C3AED"],
    ["#0EA5E9", "#F97316"],
    ["#16A34A", "#64748B"],
    ["#DB2777", "#2563EB"],
  ] as const;

  return palettes[Math.abs(hash) % palettes.length];
}

function ConfirmDeleteDialog({
  busy,
  description,
  onCancel,
  onConfirm,
  title,
}: {
  busy?: boolean;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-[#0F172A]/35 p-4"
      onClick={() => {
        if (!busy) {
          onCancel();
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
            <h2 className="text-[15px] font-semibold text-[#202350]">{title}</h2>
            <p className="mt-1 text-[12px] leading-5 text-[#69729A]">{description}</p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#DDE2EC] bg-white px-4 text-[12px] font-semibold text-[#4A5271] transition hover:bg-[#F7F8FC] disabled:cursor-wait disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex h-9 items-center justify-center rounded-[8px] bg-[#B42318] px-4 text-[12px] font-semibold text-white transition hover:bg-[#991B1B] disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SuperadminPaymentManagementClient() {
  const [payments, setPayments] = useState<AdminPaymentRecord[]>([]);
  const [pagination, setPagination] = useState<AdminPaymentsPagination>({
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
  const [deleteTarget, setDeleteTarget] = useState<AdminPaymentRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPayments = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminPayments({
        limit: PAGE_LIMIT,
        page: targetPage,
        search: debouncedSearch || undefined,
      });

      const nextPayments = response.data.payments ?? [];
      const nextPagination = response.data.pagination ?? {
        limit: PAGE_LIMIT,
        page: targetPage,
        total: nextPayments.length,
        totalPages: 1,
      };

      if (nextPayments.length === 0 && nextPagination.page > 1) {
        setPage(nextPagination.page - 1);
        return;
      }

      setPayments(nextPayments);
      setPagination(nextPagination);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to fetch payment records."));
      setPayments([]);
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
    void loadPayments(page);
  }, [loadPayments, page]);

  const handleDeletePayment = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeletingId(deleteTarget.id);
    setError("");

    try {
      await deleteAdminPayment(deleteTarget.id);
      setDeleteTarget(null);
      await loadPayments(page);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to delete this payment record."));
    } finally {
      setDeletingId(null);
    }
  };

  const pageStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const pageEnd = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-6">
      <SuperadminPageHeader title="Payment Management" subtitle="Manage payment information" />

      <div className="flex justify-end">
        <label className="flex h-9 min-w-[246px] items-center gap-2 rounded-full border border-[#E3E6EF] bg-white px-3 text-[#8C93A8]">
          <HugeiconsIcon icon={Search01Icon} className="h-4 w-4" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search user by name or email"
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
          <div className="grid min-w-[860px] grid-cols-[1.6fr_1fr_1fr_1fr_0.8fr_96px] gap-4 border-b border-[#EEF1F6] px-6 py-4 text-[11px] text-[#8A91AB]">
            <p>Name</p>
            <p>Account Type</p>
            <p>Type of Product</p>
            <p>Payment Date</p>
            <p>Amount</p>
            <p className="text-right">Actions</p>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-center text-[13px] text-[#69729A]">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="px-6 py-8 text-center text-[13px] text-[#69729A]">No payment records found.</div>
          ) : (
            payments.map((payment) => {
              const [avatarFrom, avatarTo] = getGradientSeed(payment.user?.id || payment.user?.email || payment.id);

              return (
                <div
                  key={payment.id}
                  className="grid min-w-[860px] grid-cols-[1.6fr_1fr_1fr_1fr_0.8fr_96px] gap-4 border-b border-[#F3F5F9] px-6 py-3 last:border-b-0"
                >
                  <Link href={`/superadmin/dashboard/payment-management/${payment.id}`} className="flex min-w-0 items-center gap-3">
                    <SuperadminAvatar
                      from={avatarFrom}
                      to={avatarTo}
                      initials={getInitials(payment.user?.name, payment.user?.email)}
                      size={28}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#202350]">{payment.user?.name || "Unknown user"}</p>
                      <p className="truncate text-[11px] text-[#8A91AB]">{payment.user?.email || "No email"}</p>
                    </div>
                  </Link>
                  <p className="text-[13px] capitalize text-[#34395B]">{payment.user?.role || "N/A"}</p>
                  <p className="text-[13px] text-[#34395B]">{payment.productType || "Subscription"}</p>
                  <p className="text-[13px] text-[#34395B]">{formatDate(payment.paymentDate)}</p>
                  <p className="text-[13px] text-[#34395B]">{formatAmount(payment.amount ?? payment.total, payment.currency)}</p>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(payment)}
                      disabled={deletingId === payment.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#F4C7C7] bg-white text-[#B42318] transition hover:bg-[#FFF5F5] disabled:cursor-wait disabled:opacity-60"
                      aria-label={`Delete payment for ${payment.user?.name || payment.user?.email || "user"}`}
                      title="Delete payment"
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                    </button>
                    <SuperadminPaymentActionMenu slug={payment.id} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-3 text-[10px] text-[#727A96]">
          <p>
            Showing {pageStart}-{pageEnd} of {pagination.total} payments
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

      {deleteTarget ? (
        <ConfirmDeleteDialog
          busy={Boolean(deletingId)}
          title="Delete payment?"
          description={`${deleteTarget.user?.name || deleteTarget.invoiceNumber || "This payment"} will be removed from payment management.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            void handleDeletePayment();
          }}
        />
      ) : null}
    </div>
  );
}

export function SuperadminPaymentDetailClient({
  paymentId,
}: {
  paymentId: string;
}) {
  const [payment, setPayment] = useState<AdminPaymentRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadPayment = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getAdminPayment(paymentId);

        if (active) {
          setPayment(response.data ?? null);
        }
      } catch (caughtError) {
        if (active) {
          setError(getApiErrorMessage(caughtError, "Unable to load this payment record."));
          setPayment(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadPayment();

    return () => {
      active = false;
    };
  }, [paymentId]);

  const [avatarFrom, avatarTo] = getGradientSeed(payment?.user?.id || payment?.id || "payment");

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <SuperadminBackLink href="/superadmin/dashboard/payment-management" />
          <div>
            <h1 className="text-[20px] font-semibold tracking-[-0.04em] text-[#202350]">View Payment information</h1>
            <p className="mt-1 text-[13px] text-[#69729A]">This section will help you to view plan of the user</p>
          </div>
        </div>
        <SuperadminNotificationButton />
      </div>

      {loading ? (
        <div className="rounded-[14px] border border-[#E6E9F0] bg-white px-6 py-10 text-center text-sm text-[#69729A]">
          Loading payment...
        </div>
      ) : error ? (
        <div className="rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-4 text-sm text-[#B42318]">
          {error}
        </div>
      ) : payment ? (
        <section className="space-y-8 rounded-[26px] px-6 py-6 sm:px-8 lg:px-10">
          <div className="grid gap-5 md:grid-cols-[52px_repeat(2,minmax(0,180px))_minmax(0,1fr)] md:items-start">
            <div className="md:row-span-2">
              <SuperadminAvatar
                from={avatarFrom}
                to={avatarTo}
                initials={getInitials(payment.user?.name, payment.user?.email)}
                size={52}
              />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Billing Date</p>
              <p className="mt-1 text-[14px] font-medium text-[#202350]">{formatDate(payment.paymentDate)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Status</p>
              <div className="mt-2">
                <SuperadminStatusBadge status={payment.status || "pending"} />
              </div>
            </div>
            <div />
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Name</p>
              <p className="mt-1 text-[14px] font-medium text-[#202350]">{payment.user?.name || "Unknown user"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Email</p>
              <p className="mt-1 text-[14px] font-medium text-[#202350]">{payment.user?.email || "No email"}</p>
            </div>
          </div>

          <div className="grid gap-4 rounded-[22px] border border-[#EDF1F6] bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Product</p>
              <p className="mt-1 text-[14px] font-medium text-[#202350]">{payment.productType || "Subscription"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Invoice</p>
              <p className="mt-1 text-[14px] font-medium text-[#202350]">{payment.invoiceNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Amount</p>
              <p className="mt-1 text-[14px] font-medium text-[#202350]">{formatAmount(payment.amount ?? payment.total, payment.currency)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Account Type</p>
              <p className="mt-1 text-[14px] capitalize text-[#202350]">{payment.user?.role || "N/A"}</p>
            </div>
          </div>
        </section>
      ) : (
        <div className="rounded-[14px] border border-[#E6E9F0] bg-white px-6 py-10 text-center text-sm text-[#69729A]">
          Payment record not found.
        </div>
      )}
    </div>
  );
}
