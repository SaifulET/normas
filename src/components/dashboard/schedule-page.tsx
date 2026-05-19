"use client";

import { useEffect, useMemo, useState } from "react";
import { dashboardCalendarEvent, dashboardCalendarSlots } from "./data";
import { DashboardIcon } from "./icons";
import { DashboardPageHeader } from "./page-header";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Location05Icon } from "@hugeicons/core-free-icons";
import { getApiErrorMessage } from "@/lib/api";
import { getSchedules, type MeetingRequest } from "@/lib/investment-conversations-api";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const calendarWeekdays = ["S", "M", "T", "W", "T", "F", "S"];

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatHeadlineDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatModalDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatSlotTime(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isScheduleOnSlot(schedule: MeetingRequest, date: Date, slot: string) {
  if (!schedule.startsAt) {
    return false;
  }

  const startsAt = new Date(schedule.startsAt);

  return !Number.isNaN(startsAt.getTime()) && isSameDay(startsAt, date) && formatSlotTime(schedule.startsAt) === slot;
}

function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function SchedulePage() {
  const initialSelectedDate = new Date(2026, 7, 17);
  const [displayedMonth, setDisplayedMonth] = useState(
    new Date(initialSelectedDate.getFullYear(), initialSelectedDate.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [modalOpen, setModalOpen] = useState(false);
  const [schedules, setSchedules] = useState<MeetingRequest[]>([]);
  const [scheduleError, setScheduleError] = useState("");
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [activeSchedule, setActiveSchedule] = useState<MeetingRequest | null>(null);
  const [startTime, setStartTime] = useState("1:00 AM");
  const [endTime, setEndTime] = useState("1:00 AM");
  const [location] = useState("123, Main Street");
  const [locationLine, setLocationLine] = useState("123, main street, london");
  const [timeZone, setTimeZone] = useState("Time zone");

  useEffect(() => {
    let active = true;

    async function loadSchedules() {
      setLoadingSchedules(true);
      setScheduleError("");

      try {
        const response = await getSchedules({ status: "accepted" });
        const items = Array.isArray(response.data) ? response.data : [];

        if (!active) {
          return;
        }

        setSchedules(items);

        const firstSchedule = items.find((item) => item.startsAt);

        if (firstSchedule?.startsAt) {
          const startsAt = new Date(firstSchedule.startsAt);

          if (!Number.isNaN(startsAt.getTime())) {
            setSelectedDate(startsAt);
            setDisplayedMonth(new Date(startsAt.getFullYear(), startsAt.getMonth(), 1));
          }
        }
      } catch (error) {
        if (active) {
          setScheduleError(getApiErrorMessage(error, "Unable to load schedules."));
        }
      } finally {
        if (active) {
          setLoadingSchedules(false);
        }
      }
    }

    void loadSchedules();

    return () => {
      active = false;
    };
  }, []);

  const calendarDates = useMemo(() => {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = getDaysInMonth(displayedMonth);
    const dates = Array.from({ length: totalDays }, (_, index) => new Date(year, month, index + 1));
    const leading = Array.from({ length: firstDay }, () => null);
    const trailing = Array.from({ length: (7 - ((leading.length + dates.length) % 7)) % 7 }, () => null);

    return [...leading, ...dates, ...trailing];
  }, [displayedMonth]);

  const weekDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(selectedDate);
        date.setDate(selectedDate.getDate() + index - 4);
        return date;
      }),
    [selectedDate],
  );

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + offset, 1);
    const day = Math.min(selectedDate.getDate(), getDaysInMonth(nextMonth));

    setDisplayedMonth(nextMonth);
    setSelectedDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day));
  };

  const openScheduleModal = (date: Date, slot = dashboardCalendarEvent.time, schedule: MeetingRequest | null = null) => {
    setSelectedDate(date);
    setDisplayedMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setActiveSchedule(schedule);
    setStartTime(schedule?.startsAt ? formatSlotTime(schedule.startsAt) || slot : slot);
    setEndTime(schedule?.endsAt ? formatSlotTime(schedule.endsAt) || slot : slot);
    setLocationLine(schedule?.locationDetails ?? schedule?.location ?? locationLine);
    setModalOpen(true);
  };

  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Schedule" subtitle="Set your availability in the calendar" />

      <div className="rounded-[30px] border border-[#E6EBF3] bg-white p-5 shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)] xl:p-7">
        {scheduleError ? (
          <div className="mb-5 rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
            {scheduleError}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-5 text-sm text-[#475467]">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ED6A06]" />
            Meeting
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#6B7280]" />
            Current Date
          </span>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#475467]"
                >
                  {formatMonthLabel(displayedMonth)}
                  <DashboardIcon name="chevronDown" className="h-4 w-4" />
                </button>
                <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.04em] text-[#1E2746]">
                  {formatHeadlineDate(selectedDate)}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5EAF2] text-[#314B6B]"
                  aria-label="Previous month"
                >
                  <DashboardIcon name="chevronLeft" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5EAF2] text-[#314B6B] [transform:rotate(180deg)]"
                  aria-label="Next month"
                >
                  <DashboardIcon name="chevronLeft" className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-[26px] bg-[#FBFCFE] p-4">
              <div className="mb-3 grid grid-cols-7 text-center text-xs font-medium text-[#6B7280]">
                {calendarWeekdays.map((item, index) => (
                  <span key={`${item}-${index}`}>{item}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-3 text-center text-sm text-[#475467]">
                {calendarDates.map((date, index) => {
                  if (!date) {
                    return <span key={`empty-${index}`} className="h-8 w-8" />;
                  }

                  const highlighted = isSameDay(date, selectedDate);
                  const hasSchedule = schedules.some((schedule) => {
                    if (!schedule.startsAt) {
                      return false;
                    }

                    const startsAt = new Date(schedule.startsAt);
                    return !Number.isNaN(startsAt.getTime()) && isSameDay(startsAt, date);
                  });

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={cx(
                        "mx-auto flex h-8 w-8 items-center justify-center rounded-full",
                        highlighted && "bg-[#6B7280] font-semibold text-white",
                        hasSchedule && "border border-[#ED6A06] text-[#314B6B]",
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="min-w-0 overflow-x-auto">
            <div className="grid min-w-[720px] grid-cols-[90px_repeat(7,minmax(84px,1fr))] gap-3">
              <div />
              {weekDates.map((date) => (
                <div key={date.toISOString()} className="text-center">
                  <div
                    className={cx(
                      "mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl font-semibold text-[#1E2746]",
                      isSameDay(date, selectedDate) && "bg-[#314B6B] text-white",
                    )}
                  >
                    {date.getDate()}
                  </div>
                </div>
              ))}

              {dashboardCalendarSlots.map((slot, rowIndex) => (
                <div key={slot} className="contents">
                  <div className="flex items-center text-xs font-medium text-[#475467]">{slot}</div>
                  {weekDates.map((date, columnIndex) => {
                    const schedule = schedules.find((item) => isScheduleOnSlot(item, date, slot)) ?? null;

                    return (
                      <button
                        key={`${slot}-${date.toISOString()}`}
                        type="button"
                        onClick={() => openScheduleModal(date, slot, schedule)}
                        className={cx(
                          "flex h-16 items-center justify-center rounded-2xl bg-[#E5E7EB] px-3 text-center text-[11px] text-[#475467] transition hover:bg-[#DDE3EC]",
                          schedule && "border border-[#ED6A06] bg-white",
                        )}
                      >
                        {schedule ? schedule.title || schedule.location || "Meeting" : loadingSchedules && rowIndex === 0 && columnIndex === 0 ? "Loading..." : ""}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/35 p-4">
          <div className="w-full max-w-[424px] h-[318px] rounded-[18px] bg-white p-[24px] shadow-2xl">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="inline-flex h-[24px] w-[24px] items-center justify-center text-[#111827]"
                aria-label="Close schedule modal"
              >
                <HugeiconsIcon icon={Cancel01Icon} />
              </button>
            </div>

            <div className="mt-1 space-y-4">
              {activeSchedule?.title ? (
                <h2 className="text-lg font-semibold text-[#1E2746]">{activeSchedule.title}</h2>
              ) : null}

              <div className="inline-flex items-center gap-2 text-sm text-[#1F2937]">
                <DashboardIcon name="schedule"  className="h-[24px] w-[24px]" />
                {formatModalDate(selectedDate)}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: startTime, onChange: setStartTime },
                  { value: endTime, onChange: setEndTime },
                ].map((item, index) => (
                  <div key={`${item.value}-${index}`} className="relative">
                    <select
                      value={item.value}
                      onChange={(event) => item.onChange(event.target.value)}
                      className="h-11 w-full appearance-none rounded-[8px] bg-[#8B8B8B] px-3 text-sm text-white outline-none"
                    >
                      {dashboardCalendarSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <DashboardIcon
                      name="chevronDown"
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-2 text-sm text-[#1F2937]">
                <HugeiconsIcon icon={Location05Icon} className="h-[24px] w-[24px]" />
                {activeSchedule?.location || location}
              </div>

              <input
                value={locationLine}
                onChange={(event) => setLocationLine(event.target.value)}
                className="h-11 w-full rounded-[4px] bg-[#8B8B8B] px-3 text-sm text-white outline-none placeholder:text-white/80"
              />

              <div className="flex items-center gap-3 text-sm text-[#1F2937]">
                <div className="relative">
                  <select
                    value={timeZone}
                    onChange={(event) => setTimeZone(event.target.value)}
                    className="appearance-none bg-transparent pr-5 outline-none"
                  >
                    <option>Time zone</option>
                  </select>
                  <DashboardIcon
                    name="chevronDown"
                    className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111827]"
                  />
                </div>
                <div className="text-xs text-[#1F2937]">(GMT +00:00) Coordinated Universal Time</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
