"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getAdminUsers,
  updateAdminUserAccountStatus,
  type AdminAccountStatus,
  type AdminUserRole,
  type AdminUsersPagination,
  type AdminUserSummary,
} from "@/lib/admin-users-api";
import { getApiErrorMessage } from "@/lib/api";
import { SuperadminAvatar, SuperadminStatusBadge } from "./shell";
import { SuperadminUserActionMenu } from "./user-action-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, UserGroup03Icon } from "@hugeicons/core-free-icons";

const PAGE_LIMIT = 8;
const STATUS_OPTIONS: AdminAccountStatus[] = ["pending", "active", "inactive"];

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
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

function StatusSelect({
  disabled,
  onChange,
  value,
}: {
  disabled?: boolean;
  onChange: (status: AdminAccountStatus) => void;
  value: string;
}) {
  const safeValue = STATUS_OPTIONS.includes(value as AdminAccountStatus) ? (value as AdminAccountStatus) : "pending";

  return (
    <select
      value={safeValue}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as AdminAccountStatus)}
      className="h-8 rounded-[8px] border border-[#DDE2EC] bg-white px-2 text-[12px] text-[#34395B] outline-none transition disabled:cursor-wait disabled:opacity-60"
      aria-label="Update account status"
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
      ))}
    </select>
  );
}

export function SuperadminUserManagementClient() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [pagination, setPagination] = useState<AdminUsersPagination>({
    limit: PAGE_LIMIT,
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<AdminUserRole | "">("");
  const [accountStatus, setAccountStatus] = useState<AdminAccountStatus | "">("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setLoading(true);
      setError("");

      try {
        const response = await getAdminUsers({
          accountStatus,
          limit: PAGE_LIMIT,
          page,
          role,
          search: debouncedSearch || undefined,
        });

        if (!active) return;

        setUsers(response.data.users ?? []);
        setPagination(response.data.pagination ?? {
          limit: PAGE_LIMIT,
          page,
          total: response.data.users?.length ?? 0,
          totalPages: 1,
        });
      } catch (caughtError) {
        if (!active) return;
        setError(getApiErrorMessage(caughtError, "Unable to fetch admin users"));
        setUsers([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      active = false;
    };
  }, [accountStatus, debouncedSearch, page, role]);

  const totalLabel = useMemo(() => pagination.total.toLocaleString(), [pagination.total]);
  const pageStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const pageEnd = Math.min(pagination.page * pagination.limit, pagination.total);

  async function handleStatusChange(user: AdminUserSummary, nextStatus: AdminAccountStatus) {
    if (user.accountStatus === nextStatus) return;

    const previousUsers = users;
    setUpdatingUserId(user.id);
    setUsers((current) => current.map((item) => (item.id === user.id ? { ...item, accountStatus: nextStatus } : item)));

    try {
      const response = await updateAdminUserAccountStatus(user.id, nextStatus);
      setUsers((current) => current.map((item) => (item.id === user.id ? { ...item, ...response.data } : item)));
    } catch (caughtError) {
      setUsers(previousUsers);
      setError(getApiErrorMessage(caughtError, "Unable to update account status"));
    } finally {
      setUpdatingUserId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between rounded-[14px] border border-[#E6E9F0] bg-white p-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Total User</p>
          <p className="mt-1 text-[18px] font-semibold text-[#202350]">{totalLabel}</p>
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#F2ECFB] text-[#7E61B5]">
          <HugeiconsIcon icon={UserGroup03Icon} />
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <label className="flex h-9 min-w-[260px] items-center gap-2 rounded-full border border-[#E3E6EF] bg-white px-3 text-[#8C93A8]">
          <HugeiconsIcon icon={Search01Icon} className="h-4 w-4" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, Gmail, or mobile"
            className="w-full border-0 bg-transparent text-[12px] text-[#20243A] outline-none placeholder:text-[#9AA1B6]"
          />
        </label>
        <select
          value={role}
          onChange={(event) => {
            setPage(1);
            setRole(event.target.value as AdminUserRole | "");
          }}
          className="h-9 rounded-[8px] border border-[#DDE2EC] bg-white px-3 text-[12px] text-[#525B79] outline-none"
          aria-label="Filter account type"
        >
          <option value="">All account types</option>
          <option value="investor">Investor</option>
          <option value="investee">Investee</option>
        </select>
        <select
          value={accountStatus}
          onChange={(event) => {
            setPage(1);
            setAccountStatus(event.target.value as AdminAccountStatus | "");
          }}
          className="h-9 rounded-[8px] border border-[#DDE2EC] bg-white px-3 text-[12px] text-[#525B79] outline-none"
          aria-label="Filter account status"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="rounded-[10px] border border-[#F4C7C7] bg-[#FFF5F5] px-4 py-3 text-[13px] text-[#B42318]">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[14px] border border-[#E6E9F0] bg-white">
        <div className="grid min-w-[840px] grid-cols-[2fr_1fr_1fr_1.2fr_48px] gap-4 border-b border-[#EEF1F6] px-6 py-4 text-[11px] text-[#8A91AB]">
          <p>Name</p>
          <p>Account Type</p>
          <p>Joining Date</p>
          <p>Account Status</p>
          <p className="text-right">Actions</p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 py-8 text-center text-[13px] text-[#69729A]">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="px-6 py-8 text-center text-[13px] text-[#69729A]">No investor or investee users found.</div>
          ) : (
            users.map((user) => {
              const [avatarFrom, avatarTo] = getGradientSeed(user.id || user.email || user.name || "user");

              return (
                <div
                  key={user.id}
                  className="grid min-w-[840px] grid-cols-[2fr_1fr_1fr_1.2fr_48px] gap-4 border-b border-[#F3F5F9] px-6 py-3 last:border-b-0"
                >
                  <Link href={`/superadmin/dashboard/user-management/${user.id}`} className="flex min-w-0 items-center gap-3">
                    <SuperadminAvatar
                      from={avatarFrom}
                      to={avatarTo}
                      initials={getInitials(user.name, user.email)}
                      src={user.profileImage || undefined}
                      size={28}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#202350]">{user.name || "Unnamed user"}</p>
                      <p className="truncate text-[11px] text-[#8A91AB]">{user.gmail || user.email || "No email"}</p>
                    </div>
                  </Link>
                  <p className="text-[13px] capitalize text-[#34395B]">{user.accountType || user.role || "N/A"}</p>
                  <p className="text-[13px] text-[#34395B]">{formatDate(user.joiningDate || user.createdAt)}</p>
                  <div className="flex items-center gap-2">
                    <SuperadminStatusBadge status={user.accountStatus || "pending"} />
                    <StatusSelect
                      value={user.accountStatus || "pending"}
                      disabled={updatingUserId === user.id}
                      onChange={(status) => void handleStatusChange(user, status)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <SuperadminUserActionMenu slug={user.id} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-3 text-[10px] text-[#727A96]">
          <p>
            Showing {pageStart}-{pageEnd} of {pagination.total} members
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className={cx(
                "inline-flex h-6 min-w-6 items-center justify-center rounded-[8px] border border-[#E4E8F0] px-2",
                pagination.page <= 1 || loading ? "text-[#C2C8D6]" : "text-[#4A5271] hover:bg-[#F7F8FC]",
              )}
            >
              Prev
            </button>
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-[8px] border border-[#CFD5E3] bg-white px-2 text-[#4A5271]">
              {pagination.page}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
              className={cx(
                "inline-flex h-6 min-w-6 items-center justify-center rounded-[8px] border border-[#E4E8F0] px-2",
                pagination.page >= pagination.totalPages || loading ? "text-[#C2C8D6]" : "text-[#4A5271] hover:bg-[#F7F8FC]",
              )}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
