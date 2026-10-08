"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteAdminUser,
  deleteAdminUsers,
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
import { Delete02Icon, Search01Icon, UserGroup03Icon } from "@hugeicons/core-free-icons";

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
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserSummary | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadUsers = useCallback(async (targetPage: number, options: { silent?: boolean } = {}) => {
    if (!options.silent) {
      setLoading(true);
    }

    setError("");

    try {
      const response = await getAdminUsers({
        accountStatus,
        limit: PAGE_LIMIT,
        page: targetPage,
        role,
        search: debouncedSearch || undefined,
      });

      setUsers(response.data.users ?? []);
      setPagination(response.data.pagination ?? {
        limit: PAGE_LIMIT,
        page: targetPage,
        total: response.data.users?.length ?? 0,
        totalPages: 1,
      });
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to fetch admin users"));
      setUsers([]);
    } finally {
      if (!options.silent) {
        setLoading(false);
      }
    }
  }, [accountStatus, debouncedSearch, role]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let active = true;

    async function loadActiveUsers() {
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

    void loadActiveUsers();

    return () => {
      active = false;
    };
  }, [accountStatus, debouncedSearch, page, role]);

  const totalLabel = useMemo(() => pagination.total.toLocaleString(), [pagination.total]);
  const pageStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const pageEnd = Math.min(pagination.page * pagination.limit, pagination.total);
  const selectedUserIdSet = useMemo(() => new Set(selectedUserIds), [selectedUserIds]);
  const selectedCount = selectedUserIds.length;
  const visibleUserIds = useMemo(() => users.map((user) => user.id), [users]);
  const visibleSelectedCount = visibleUserIds.filter((userId) => selectedUserIdSet.has(userId)).length;
  const allVisibleSelected = visibleUserIds.length > 0 && visibleSelectedCount === visibleUserIds.length;
  const someVisibleSelected = visibleSelectedCount > 0 && !allVisibleSelected;

  async function refreshAfterDelete(deletedCount: number) {
    const nextTotal = Math.max(0, pagination.total - deletedCount);
    const nextTotalPages = Math.max(1, Math.ceil(nextTotal / PAGE_LIMIT));
    const nextPage = Math.min(page, nextTotalPages);

    if (nextPage !== page) {
      setPage(nextPage);
    } else {
      await loadUsers(nextPage, { silent: true });
    }
  }

  function toggleUserSelection(userId: string) {
    setSelectedUserIds((current) =>
      current.includes(userId) ? current.filter((selectedId) => selectedId !== userId) : [...current, userId],
    );
  }

  function toggleVisibleSelection() {
    setSelectedUserIds((current) => {
      const currentSet = new Set(current);

      if (allVisibleSelected) {
        visibleUserIds.forEach((userId) => currentSet.delete(userId));
      } else {
        visibleUserIds.forEach((userId) => currentSet.add(userId));
      }

      return [...currentSet];
    });
  }

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

  async function handleDeleteUser() {
    if (!deleteTarget) {
      return;
    }

    setDeletingUserId(deleteTarget.id);
    setError("");

    try {
      await deleteAdminUser(deleteTarget.id);
      setSelectedUserIds((current) => current.filter((userId) => userId !== deleteTarget.id));
      setDeleteTarget(null);
      await refreshAfterDelete(1);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to delete user"));
    } finally {
      setDeletingUserId(null);
    }
  }

  async function handleBulkDeleteUsers() {
    if (selectedUserIds.length === 0) {
      return;
    }

    setBulkDeleting(true);
    setError("");

    try {
      const response = await deleteAdminUsers(selectedUserIds);
      const deletedCount = response.data.deletedCount || selectedUserIds.length;

      setSelectedUserIds([]);
      setBulkDeleteOpen(false);
      await refreshAfterDelete(deletedCount);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to delete selected users"));
    } finally {
      setBulkDeleting(false);
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <label className="flex h-9 w-full sm:w-auto sm:min-w-[260px] items-center gap-2 rounded-full border border-[#E3E6EF] bg-white px-3 text-[#8C93A8]">
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
          className="h-9 w-full sm:w-auto rounded-[8px] border border-[#DDE2EC] bg-white px-3 text-[12px] text-[#525B79] outline-none"
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
          className="h-9 w-full sm:w-auto rounded-[8px] border border-[#DDE2EC] bg-white px-3 text-[12px] text-[#525B79] outline-none"
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

      {selectedCount > 0 ? (
        <div className="flex flex-col gap-3 rounded-[12px] border border-[#F4C7C7] bg-[#FFF9F9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] font-medium text-[#202350]">
            {selectedCount} user{selectedCount === 1 ? "" : "s"} marked
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedUserIds([])}
              className="inline-flex h-8 items-center justify-center rounded-[8px] border border-[#DDE2EC] bg-white px-3 text-[12px] font-semibold text-[#4A5271] transition hover:bg-[#F7F8FC]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setBulkDeleteOpen(true)}
              className="inline-flex h-8 items-center justify-center gap-2 rounded-[8px] bg-[#B42318] px-3 text-[12px] font-semibold text-white transition hover:bg-[#991B1B]"
            >
              <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
              Delete marked
            </button>
          </div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[14px] border border-[#E6E9F0] bg-white">
        <div className="overflow-x-auto">
          <div className="grid min-w-[960px] grid-cols-[36px_2fr_1fr_1fr_1.2fr_96px] gap-4 border-b border-[#EEF1F6] px-6 py-4 text-[11px] text-[#8A91AB]">
            <label className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someVisibleSelected;
                  }
                }}
                onChange={toggleVisibleSelection}
                className="h-4 w-4 rounded border-[#CBD5E1] accent-[#B42318]"
                aria-label="Mark all visible users"
              />
            </label>
            <p>Name</p>
            <p>Account Type</p>
            <p>Joining Date</p>
            <p>Account Status</p>
            <p className="text-right">Actions</p>
          </div>

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
                  className={cx(
                    "grid min-w-[960px] grid-cols-[36px_2fr_1fr_1fr_1.2fr_96px] gap-4 border-b border-[#F3F5F9] px-6 py-3 last:border-b-0",
                    selectedUserIdSet.has(user.id) && "bg-[#FFF9F9]",
                  )}
                >
                  <label className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedUserIdSet.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="h-4 w-4 rounded border-[#CBD5E1] accent-[#B42318]"
                      aria-label={`Mark ${user.name || user.email || "user"}`}
                    />
                  </label>
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
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(user)}
                      disabled={deletingUserId === user.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#F4C7C7] bg-white text-[#B42318] transition hover:bg-[#FFF5F5] disabled:cursor-wait disabled:opacity-60"
                      aria-label={`Delete ${user.name || user.email || "user"}`}
                      title="Delete user"
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                    </button>
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

      {deleteTarget || bulkDeleteOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/35 p-4"
          onClick={() => {
            if (!deletingUserId && !bulkDeleting) {
              setDeleteTarget(null);
              setBulkDeleteOpen(false);
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
                <h2 className="text-[15px] font-semibold text-[#202350]">
                  {bulkDeleteOpen ? "Delete marked users?" : "Delete user?"}
                </h2>
                <p className="mt-1 text-[12px] leading-5 text-[#69729A]">
                  {bulkDeleteOpen
                    ? `${selectedCount} marked user${selectedCount === 1 ? "" : "s"} will be removed from user management.`
                    : `${deleteTarget?.name || deleteTarget?.email || "This user"} will be removed from user management.`}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setBulkDeleteOpen(false);
                }}
                disabled={Boolean(deletingUserId) || bulkDeleting}
                className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#DDE2EC] bg-white px-4 text-[12px] font-semibold text-[#4A5271] transition hover:bg-[#F7F8FC] disabled:cursor-wait disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (bulkDeleteOpen) {
                    void handleBulkDeleteUsers();
                  } else {
                    void handleDeleteUser();
                  }
                }}
                disabled={Boolean(deletingUserId) || bulkDeleting}
                className="inline-flex h-9 items-center justify-center rounded-[8px] bg-[#B42318] px-4 text-[12px] font-semibold text-white transition hover:bg-[#991B1B] disabled:cursor-wait disabled:opacity-60"
              >
                {deletingUserId || bulkDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
