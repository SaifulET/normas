"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import { getSchedules, type Schedule } from "@/lib/schedule-api";

type DashboardSchedulePreviewProps = {
  href: string;
  limit?: number;
};

function getScheduleStart(schedule: Schedule) {
  return schedule.startsAt ?? schedule.dateTime;
}

function getValidDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatScheduleDay(value?: string, timeZone?: string) {
  const date = getValidDate(value);

  if (!date) {
    return "Date not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone,
    weekday: "long",
  }).format(date);
}

function formatScheduleTime(schedule: Schedule) {
  const start = getValidDate(getScheduleStart(schedule));
  const end = getValidDate(schedule.endsAt);
  const timeZone = schedule.timeZone || undefined;

  if (!start) {
    return "Time not set";
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });

  return end && end > start ? `${formatter.format(start)} - ${formatter.format(end)}` : formatter.format(start);
}

function getParticipantName(schedule: Schedule) {
  return schedule.investee?.name ?? schedule.investor?.name ?? schedule.createdBy?.name ?? "";
}

export function DashboardSchedulePreview({ href, limit = 3 }: DashboardSchedulePreviewProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSchedules = async () => {
      setLoading(true);
      setError("");

      try {
        const from = new Date();
        const to = new Date(from);
        to.setMonth(to.getMonth() + 3);

        const response = await getSchedules({
          from: from.toISOString(),
          to: to.toISOString(),
        });

        const upcoming = (response.data ?? [])
          .filter((schedule) => getValidDate(getScheduleStart(schedule)))
          .sort((left, right) => {
            const leftTime = getValidDate(getScheduleStart(left))?.getTime() ?? 0;
            const rightTime = getValidDate(getScheduleStart(right))?.getTime() ?? 0;
            return leftTime - rightTime;
          })
          .slice(0, limit);

        if (active) {
          setSchedules(upcoming);
        }
      } catch (scheduleError) {
        if (active) {
          setError(getApiErrorMessage(scheduleError, "Unable to load schedules."));
          setSchedules([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadSchedules();

    return () => {
      active = false;
    };
  }, [limit]);

  const placeholderRows = useMemo(() => Array.from({ length: Math.min(limit, 3) }, (_, index) => index), [limit]);

  if (loading) {
    return (
      <div className="mt-6 space-y-3">
        {placeholderRows.map((item) => (
          <div key={item} className="rounded-[22px] bg-[#F8FAFC] px-4 py-4">
            <div className="h-4 w-32 animate-pulse rounded bg-[#E6EBF3]" />
            <div className="mt-3 h-3 w-44 animate-pulse rounded bg-[#E6EBF3]" />
            <div className="mt-4 h-3 w-56 animate-pulse rounded bg-[#EDF2F7]" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-[22px] bg-[#FFF7ED] px-4 py-4 text-sm text-[#9A3412]">
        {error}
      </div>
    );
  }

  if (!schedules.length) {
    return (
      <div className="mt-6 rounded-[22px] bg-[#F8FAFC] px-4 py-5 text-sm text-[#6B7280]">
        No upcoming schedules yet.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {schedules.map((schedule) => {
        const scheduleStart = getScheduleStart(schedule);
        const participantName = getParticipantName(schedule);
        const scheduleHref = schedule._id ? `${href}?scheduleId=${encodeURIComponent(schedule._id)}` : href;

        return (
          <Link
            key={schedule._id || `${schedule.title}-${scheduleStart}`}
            href={scheduleHref}
            className="flex items-center justify-between gap-4 rounded-[22px] bg-[#F8FAFC] px-4 py-4 transition hover:bg-[#F2F6FB]"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1E2746]">
                {formatScheduleDay(scheduleStart, schedule.timeZone || undefined)}
              </p>
              <p className="mt-1 text-sm text-[#6B7280]">{formatScheduleTime(schedule)}</p>
              <p className="mt-2 truncate text-xs uppercase tracking-[0.14em] text-[#98A2B3]">
                {schedule.title || participantName || schedule.location || "Scheduled meeting"}
              </p>
            </div>
            <span className="shrink-0 text-xl text-[#314B6B]" aria-hidden="true">
              {">"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
