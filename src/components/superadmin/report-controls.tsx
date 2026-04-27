"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SuperadminReportRecord, SuperadminSupportRecord } from "./data";
import { getSuperadminUser } from "./data";
import { SuperadminAvatar, SuperadminDotsButton, SuperadminStatusBadge } from "./shell";

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
          <div className="border-t border-[#EEF1F6] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">
            Action
          </div>
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
            Warn User
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="block w-full px-4 py-3 text-left text-[14px] text-[#202350] transition hover:bg-[#F7F8FC]"
          >
            Dismiss Report
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

function TableFooter() {
  return (
    <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-3 text-[10px] text-[#727A96]">
      <p>Showing 1-4 of 24 members</p>
      <div className="flex items-center gap-2">
        <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-[8px] border border-[#E4E8F0] text-[#C2C8D6]">
          {"<"}
        </button>
        <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-[8px] border border-[#CFD5E3] bg-white text-[#4A5271]">
          1
        </button>
        <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-[8px] border border-[#E4E8F0] text-[#9AA1B6]">
          2
        </button>
        <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-[8px] border border-[#E4E8F0] text-[#C2C8D6]">
          {">"}
        </button>
      </div>
    </div>
  );
}

export function SuperadminReportsPanel({
  records,
}: {
  records: SuperadminReportRecord[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | "Dismissed" | "Pending" | "Resolved">("All");

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      const reporter = getSuperadminUser(record.reportBySlug);
      const reported = getSuperadminUser(record.reportedUserSlug);

      if (!reporter || !reported) {
        return false;
      }

      const matchesStatus = status === "All" ? true : record.status === status;
      const matchesQuery =
        !normalizedQuery ||
        reporter.name.toLowerCase().includes(normalizedQuery) ||
        reporter.email.toLowerCase().includes(normalizedQuery) ||
        reported.name.toLowerCase().includes(normalizedQuery) ||
        reported.email.toLowerCase().includes(normalizedQuery) ||
        record.type.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, records, status]);

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

      <div className="overflow-visible rounded-[14px] border border-[#E6E9F0] bg-white">
        <div className="grid grid-cols-[1.2fr_1.2fr_0.8fr_0.8fr_48px] gap-4 border-b border-[#EEF1F6] px-6 py-4 text-[11px] text-[#8A91AB]">
          <p>Report by</p>
          <p>Reported user</p>
          <p>Type</p>
          <p>Status</p>
          <p className="text-right">Actions</p>
        </div>

        {filteredRecords.map((record) => {
          const reporter = getSuperadminUser(record.reportBySlug);
          const reported = getSuperadminUser(record.reportedUserSlug);

          if (!reporter || !reported) {
            return null;
          }

          return (
            <div
              key={record.slug}
              className="grid grid-cols-[1.2fr_1.2fr_0.8fr_0.8fr_48px] gap-4 border-b border-[#F3F5F9] px-6 py-3 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <SuperadminAvatar from={reporter.avatarFrom} to={reporter.avatarTo} initials={reporter.initials} size={28} />
                <div>
                  <p className="text-[13px] font-medium text-[#202350]">{reporter.name}</p>
                  <p className="text-[11px] text-[#8A91AB]">{reporter.email}</p>
                </div>
              </div>
              <Link href={`/superadmin/dashboard/reports/${record.slug}`} className="flex items-center gap-3">
                <SuperadminAvatar from={reported.avatarFrom} to={reported.avatarTo} initials={reported.initials} size={28} />
                <div>
                  <p className="text-[13px] font-medium text-[#202350]">{reported.name}</p>
                  <p className="text-[11px] text-[#8A91AB]">{reported.email}</p>
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
          );
        })}

        <TableFooter />
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

        {filteredRecords.map((record) => {
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

        <TableFooter />
      </div>
    </div>
  );
}
