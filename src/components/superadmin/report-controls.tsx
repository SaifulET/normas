"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SuperadminReportRecord, SuperadminSupportRecord } from "./data";
import { getSuperadminUser } from "./data";
import { SuperadminAvatar, SuperadminDotsButton, SuperadminStatusBadge } from "./shell";
import { getApiErrorMessage } from "@/lib/api";
import { getReports, type Report } from "@/lib/report-api";

const PAGE_LIMIT = 8;

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

function useCloseOnOutsideClick(open: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, open]);

  return containerRef;
}

function ReportStatusFilter({
  value,
  onChange,
}: {
  value: "All" | "Dismissed" | "Pending" | "Resolved";
  onChange: (value: "All" | "Dismissed" | "Pending" | "Resolved") => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useCloseOnOutsideClick(open, () => setOpen(false));
  const options: Array<"Pending" | "Resolved" | "Dismissed"> = ["Pending", "Resolved", "Dismissed"];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#DDE2EC] bg-white px-3 text-[12px] text-[#525B79]"
      >
        <span>{value === "All" ? "Status" : value}</span>
        <ChevronDownIcon />
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-20 min-w-[132px] overflow-hidden rounded-[6px] border border-[#E7EAF1] bg-white shadow-[0_16px_32px_-18px_rgba(15,23,42,0.35)]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="block w-full px-4 py-3 text-left text-[14px] text-[#202350] transition hover:bg-[#F7F8FC]"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SuperadminSupportStatusDropdown({
  value,
  onChange,
}: {
  value: "All" | "Dismissed" | "Pending" | "Solved";
  onChange: (value: "All" | "Dismissed" | "Pending" | "Solved") => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useCloseOnOutsideClick(open, () => setOpen(false));
  const options: Array<"Pending" | "Solved" | "Dismissed"> = ["Pending", "Solved", "Dismissed"];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#DDE2EC] bg-white px-3 text-[12px] text-[#525B79]"
      >
        <span>{value === "All" ? "Status" : value}</span>
        <ChevronDownIcon />
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-20 min-w-[132px] overflow-hidden rounded-[6px] border border-[#E7EAF1] bg-white shadow-[0_16px_32px_-18px_rgba(15,23,42,0.35)]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="block w-full px-4 py-3 text-left text-[14px] text-[#202350] transition hover:bg-[#F7F8FC]"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SuperadminSupportDetailStatusDropdown({
  initialValue,
}: {
  initialValue: "Dismissed" | "Pending" | "Solved";
}) {
  const [value, setValue] = useState<"Dismissed" | "Pending" | "Solved">(initialValue);

  return <SuperadminSupportStatusDropdown value={value} onChange={(next) => next !== "All" && setValue(next)} />;
}

function ReportActionMenu({
  slug,
}: {
  slug: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useCloseOnOutsideClick(open, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative">
      <SuperadminDotsButton onClick={() => setOpen((current) => !current)} />

      {open ? (
        <div className="absolute right-0 top-9 z-20 min-w-[170px] overflow-hidden rounded-[6px] border border-[#E7EAF1] bg-white shadow-[0_16px_32px_-18px_rgba(15,23,42,0.35)]">
          <Link
            href={`/superadmin/dashboard/reports/${slug}`}
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-[14px] text-[#202350] transition hover:bg-[#F7F8FC]"
          >
            View
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="block w-full px-4 py-3 text-left text-[14px] text-[#EF4444] transition hover:bg-[#F7F8FC]"
          >
            Delete
          </button>
          
        </div>
      ) : null}
    </div>
  );
}

function SupportActionMenu({
  slug,
}: {
  slug: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useCloseOnOutsideClick(open, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative">
      <SuperadminDotsButton onClick={() => setOpen((current) => !current)} />

      {open ? (
        <div className="absolute right-0 top-9 z-20 min-w-[170px] overflow-hidden rounded-[6px] border border-[#E7EAF1] bg-white shadow-[0_16px_32px_-18px_rgba(15,23,42,0.35)]">
          <Link
            href={`/superadmin/dashboard/support-center/${slug}`}
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-[14px] text-[#202350] transition hover:bg-[#F7F8FC]"
          >
            View
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="block w-full px-4 py-3 text-left text-[14px] text-[#EF4444] transition hover:bg-[#F7F8FC]"
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function SuperadminReportDetailActionMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useCloseOnOutsideClick(open, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-[#DDE2EC] bg-white px-3 text-[12px] text-[#525B79]"
      >
        <span>Action</span>
        <ChevronDownIcon />
      </button>

      {open ? (
        <div className="absolute right-0 top-10 z-20 min-w-[170px] overflow-hidden rounded-[6px] border border-[#E7EAF1] bg-white shadow-[0_16px_32px_-18px_rgba(15,23,42,0.35)]">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="block w-full px-4 py-3 text-left text-[14px] text-[#202350] transition hover:bg-[#F7F8FC]"
          >
            Remove Content
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="block w-full px-4 py-3 text-left text-[14px] text-[#202350] transition hover:bg-[#F7F8FC]"
          >
            Banned User
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="block w-full px-4 py-3 text-left text-[14px] text-[#202350] transition hover:bg-[#F7F8FC]"
          >
            Dismiss Report
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="block w-full border-t border-[#EEF1F6] px-4 py-3 text-left text-[14px] text-[#EF4444] transition hover:bg-[#F7F8FC]"
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

function TableFooter({
  itemLabel = "items",
  onNext,
  onPrevious,
  page,
  pageEnd,
  pageStart,
  total,
  totalPages,
}: {
  itemLabel?: string;
  onNext: () => void;
  onPrevious: () => void;
  page: number;
  pageEnd: number;
  pageStart: number;
  total: number;
  totalPages: number;
}) {
  return (
    <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-3 text-[10px] text-[#727A96]">
      <p>
        Showing {pageStart}-{pageEnd} of {total} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={onPrevious}
          className={`inline-flex h-6 min-w-6 items-center justify-center rounded-[8px] border border-[#E4E8F0] px-2 ${
            page <= 1 ? "text-[#C2C8D6]" : "text-[#4A5271] hover:bg-[#F7F8FC]"
          }`}
        >
          Prev
        </button>
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-[8px] border border-[#CFD5E3] bg-white px-2 text-[#4A5271]">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={onNext}
          className={`inline-flex h-6 min-w-6 items-center justify-center rounded-[8px] border border-[#E4E8F0] px-2 ${
            page >= totalPages ? "text-[#C2C8D6]" : "text-[#4A5271] hover:bg-[#F7F8FC]"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

type ReportTableRecord = {
  createdAt?: string;
  imageSrc?: string;
  reportByEmail: string;
  reportByName: string;
  reportedEmail: string;
  reportedName: string;
  slug: string;
  status: "Resolved" | "Dismissed" | "Pending";
  type: string;
};

function normalizeReportStatus(status?: string): ReportTableRecord["status"] {
  if (status === "solved") {
    return "Resolved";
  }

  if (status === "dismiss") {
    return "Dismissed";
  }

  return "Pending";
}

function getPopulatedUserName(user: Report["user"]) {
  if (user && typeof user === "object") {
    return user.name?.trim() || user.email?.trim() || "Unknown user";
  }

  return "Unknown user";
}

function getPopulatedUserEmail(user: Report["user"]) {
  return user && typeof user === "object" ? user.email?.trim() || "" : "";
}

function getPopulatedListTitle(list: Report["list"]) {
  return list && typeof list === "object" ? list.title?.trim() || "Reported pitch" : "Reported pitch";
}

function getPopulatedListOwner(list: Report["list"]) {
  if (!list || typeof list !== "object" || !list.user || typeof list.user !== "object") {
    return "";
  }

  return list.user.name?.trim() || list.user.email?.trim() || "";
}

function mapApiReportToTableRecord(report: Report): ReportTableRecord {
  const reportedTitle = getPopulatedListTitle(report.list);
  const listOwner = getPopulatedListOwner(report.list);

  return {
    createdAt: report.createdAt,
    imageSrc: report.list && typeof report.list === "object" ? report.list.bannerImage || "" : "",
    reportByEmail: getPopulatedUserEmail(report.user),
    reportByName: getPopulatedUserName(report.user),
    reportedEmail: listOwner,
    reportedName: reportedTitle,
    slug: report._id,
    status: normalizeReportStatus(report.status),
    type: "Pitch",
  };
}

function mapStaticReportToTableRecord(record: SuperadminReportRecord): ReportTableRecord | null {
  const reporter = getSuperadminUser(record.reportBySlug);
  const reported = getSuperadminUser(record.reportedUserSlug);

  if (!reporter || !reported) {
    return null;
  }

  return {
    imageSrc: record.imageSrc,
    reportByEmail: reporter.email,
    reportByName: reporter.name,
    reportedEmail: reported.email,
    reportedName: reported.name,
    slug: record.slug,
    status: record.status,
    type: record.type,
  };
}

export function SuperadminReportsPanel({
  records,
}: {
  records: SuperadminReportRecord[];
}) {
  const [query, setQuery] = useState("");
  const [apiReports, setApiReports] = useState<ReportTableRecord[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"All" | "Dismissed" | "Pending" | "Resolved">("All");
  const fallbackRecords = useMemo(
    () => records.map(mapStaticReportToTableRecord).filter((record): record is ReportTableRecord => Boolean(record)),
    [records],
  );
  const tableRecords = apiReports.length > 0 || !reportsError ? apiReports : fallbackRecords;

  useEffect(() => {
    let active = true;

    const loadReports = async () => {
      setLoadingReports(true);
      setReportsError("");

      try {
        const response = await getReports();
        const nextReports = (response.data ?? []).map(mapApiReportToTableRecord);

        if (active) {
          setApiReports(nextReports);
        }
      } catch (error) {
        if (active) {
          setReportsError(getApiErrorMessage(error, "Unable to load backend reports."));
          setApiReports([]);
        }
      } finally {
        if (active) {
          setLoadingReports(false);
        }
      }
    };

    void loadReports();

    return () => {
      active = false;
    };
  }, []);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tableRecords.filter((record) => {
      const matchesStatus = status === "All" ? true : record.status === status;
      const matchesQuery =
        !normalizedQuery ||
        record.reportByName.toLowerCase().includes(normalizedQuery) ||
        record.reportByEmail.toLowerCase().includes(normalizedQuery) ||
        record.reportedName.toLowerCase().includes(normalizedQuery) ||
        record.reportedEmail.toLowerCase().includes(normalizedQuery) ||
        record.type.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, status, tableRecords]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_LIMIT));
  const safePage = Math.min(page, totalPages);
  const pageStart = filteredRecords.length === 0 ? 0 : (safePage - 1) * PAGE_LIMIT + 1;
  const pageEnd = Math.min(safePage * PAGE_LIMIT, filteredRecords.length);
  const paginatedRecords = filteredRecords.slice((safePage - 1) * PAGE_LIMIT, safePage * PAGE_LIMIT);

  useEffect(() => {
    setPage(1);
  }, [query, status]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <label className="flex h-9 min-w-[246px] items-center gap-2 rounded-full border border-[#E3E6EF] bg-white px-3 text-[#8C93A8]">
          <SearchIcon />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search user by name or company name"
            className="w-full border-0 bg-transparent text-[12px] text-[#20243A] outline-none placeholder:text-[#9AA1B6]"
          />
        </label>
        <ReportStatusFilter value={status} onChange={setStatus} />
      </div>

      {reportsError ? (
        <div className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
          {reportsError}
        </div>
      ) : null}

      <div className="overflow-visible rounded-[14px] border border-[#E6E9F0] bg-white">
        <div className="grid grid-cols-[1.2fr_1.2fr_0.8fr_0.8fr_48px] gap-4 border-b border-[#EEF1F6] px-6 py-4 text-[11px] text-[#8A91AB]">
          <p>Report by</p>
          <p>Reported user</p>
          <p>Type</p>
          <p>Status</p>
          <p className="text-right">Actions</p>
        </div>

        {loadingReports ? (
          <div className="px-6 py-8 text-center text-[13px] text-[#8A91AB]">Loading reports...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="px-6 py-8 text-center text-[13px] text-[#8A91AB]">No reports found.</div>
        ) : (
          paginatedRecords.map((record) => (
            <div
              key={record.slug}
              className="grid grid-cols-[1.2fr_1.2fr_0.8fr_0.8fr_48px] gap-4 border-b border-[#F3F5F9] px-6 py-3 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <SuperadminAvatar from="#8E9BFF" to="#F59E0B" initials={record.reportByName.slice(0, 2).toUpperCase()} size={28} />
                <div>
                  <p className="text-[13px] font-medium text-[#202350]">{record.reportByName}</p>
                  <p className="text-[11px] text-[#8A91AB]">{record.reportByEmail || "No email"}</p>
                </div>
              </div>
              <Link href={`/superadmin/dashboard/reports/${record.slug}`} className="flex items-center gap-3">
                <SuperadminAvatar from="#22C55E" to="#38BDF8" initials={record.reportedName.slice(0, 2).toUpperCase()} size={28} />
                <div>
                  <p className="text-[13px] font-medium text-[#202350]">{record.reportedName}</p>
                  <p className="text-[11px] text-[#8A91AB]">{record.reportedEmail || "Reported pitch"}</p>
                </div>
              </Link>
              <p className="text-[13px] text-[#34395B]">{record.type}</p>
              <div>
                <SuperadminStatusBadge status={record.status} />
              </div>
              <div className="flex justify-end">
                <ReportActionMenu slug={record.slug} />
              </div>
            </div>
          ))
        )}

        <TableFooter
          itemLabel="reports"
          onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          page={safePage}
          pageEnd={pageEnd}
          pageStart={pageStart}
          total={filteredRecords.length}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}

export function SuperadminSupportPanel({
  records,
}: {
  records: SuperadminSupportRecord[];
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"All" | "Dismissed" | "Pending" | "Solved">("All");

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      const user = getSuperadminUser(record.userSlug);

      if (!user) {
        return false;
      }

      const matchesStatus = status === "All" ? true : record.status === status;
      const matchesQuery =
        !normalizedQuery ||
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        record.topic.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, records, status]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_LIMIT));
  const safePage = Math.min(page, totalPages);
  const pageStart = filteredRecords.length === 0 ? 0 : (safePage - 1) * PAGE_LIMIT + 1;
  const pageEnd = Math.min(safePage * PAGE_LIMIT, filteredRecords.length);
  const paginatedRecords = filteredRecords.slice((safePage - 1) * PAGE_LIMIT, safePage * PAGE_LIMIT);

  useEffect(() => {
    setPage(1);
  }, [query, status]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <label className="flex h-9 min-w-[246px] items-center gap-2 rounded-full border border-[#E3E6EF] bg-white px-3 text-[#8C93A8]">
          <SearchIcon />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search user by name or company name"
            className="w-full border-0 bg-transparent text-[12px] text-[#20243A] outline-none placeholder:text-[#9AA1B6]"
          />
        </label>
        <SuperadminSupportStatusDropdown value={status} onChange={setStatus} />
      </div>

      <div className="overflow-visible rounded-[14px] border border-[#E6E9F0] bg-white">
        <div className="grid grid-cols-[1.2fr_1.4fr_0.7fr_48px] gap-4 border-b border-[#EEF1F6] px-6 py-4 text-[11px] text-[#8A91AB]">
          <p>Buyer & Email</p>
          <p>Topic</p>
          <p>Status</p>
          <p className="text-right">Actions</p>
        </div>

        {paginatedRecords.map((record) => {
          const user = getSuperadminUser(record.userSlug);

          if (!user) {
            return null;
          }

          return (
            <div
              key={record.slug}
              className="grid grid-cols-[1.2fr_1.4fr_0.7fr_48px] gap-4 border-b border-[#F3F5F9] px-6 py-3 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <SuperadminAvatar from={user.avatarFrom} to={user.avatarTo} initials={user.initials} size={28} />
                <div>
                  <p className="text-[13px] font-medium text-[#202350]">{user.name}</p>
                  <p className="text-[11px] text-[#8A91AB]">{user.email}</p>
                </div>
              </div>
              <Link href={`/superadmin/dashboard/support-center/${record.slug}`} className="text-[13px] font-medium text-[#202350]">
                {record.topic}
              </Link>
              <div>
                <SuperadminStatusBadge status={record.status} />
              </div>
              <div className="flex justify-end">
                <SupportActionMenu slug={record.slug} />
              </div>
            </div>
          );
        })}

        <TableFooter
          itemLabel="support requests"
          onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          page={safePage}
          pageEnd={pageEnd}
          pageStart={pageStart}
          total={filteredRecords.length}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
