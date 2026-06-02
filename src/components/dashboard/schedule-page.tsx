"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { dashboardCalendarSlots } from "./data";
import { DashboardIcon } from "./icons";
import { DashboardPageHeader } from "./page-header";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Location05Icon } from "@hugeicons/core-free-icons";
import { getApiErrorMessage } from "@/lib/api";
import {
  createSchedule,
  deleteSchedule,
  getSchedule,
  getSchedules,
  updateSchedule,
  type Schedule,
  type SchedulePayload,
} from "@/lib/schedule-api";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const calendarWeekdays = ["S", "M", "T", "W", "T", "F", "S"];

type ScheduleAudience = "investee" | "investor" | "superadmin";

type SchedulePageProps = {
  audience?: ScheduleAudience;
};

type ScheduleFormMode = "create" | "edit";

type ScheduleFormState = {
  conversationId: string;
  dateTime: string;
  investeeId: string;
  investorId: string;
  location: string;
  timeZone: string;
  title: string;
};

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

function getScheduleStart(schedule: Schedule) {
  return schedule.startsAt ?? schedule.dateTime;
}

function getParticipantId(user?: Schedule["investor"]) {
  return user?._id ?? user?.id ?? "";
}

function getConversationId(schedule?: Schedule | null) {
  const conversation = schedule?.conversation;

  if (!conversation) {
    return "";
  }

  return typeof conversation === "string" ? conversation : conversation._id ?? "";
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

function formatDateTime(value?: string) {
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
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getTimeSlotMinutes(slot: string) {
  const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();
  const normalizedHour = hour === 12 ? 0 : hour;

  return normalizedHour * 60 + minute + (period === "PM" ? 12 * 60 : 0);
}

function getDateWithSlot(date: Date, slot?: string) {
  const nextDate = new Date(date);
  const minutes = slot ? getTimeSlotMinutes(slot) : Number.MAX_SAFE_INTEGER;

  if (minutes !== Number.MAX_SAFE_INTEGER) {
    nextDate.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return nextDate;
  }

  nextDate.setHours(9, 0, 0, 0);
  return nextDate;
}

function isScheduleOnSlot(schedule: Schedule, date: Date, slot: string) {
  const scheduleStart = getScheduleStart(schedule);

  if (!scheduleStart) {
    return false;
  }

  const startsAt = new Date(scheduleStart);

  return !Number.isNaN(startsAt.getTime()) && isSameDay(startsAt, date) && formatSlotTime(scheduleStart) === slot;
}

function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getMonthRange(date: Date) {
  const from = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function toDateTimeLocalValue(value?: string, fallbackDate?: Date) {
  const date = value ? new Date(value) : fallbackDate;

  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function buildIsoFromLocalDateTime(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function createScheduleFormState(date: Date, schedule?: Schedule | null): ScheduleFormState {
  const start = getScheduleStart(schedule ?? ({} as Schedule));

  return {
    conversationId: getConversationId(schedule),
    dateTime: toDateTimeLocalValue(start, date),
    investeeId: getParticipantId(schedule?.investee),
    investorId: getParticipantId(schedule?.investor),
    location: schedule?.location ?? "",
    timeZone: schedule?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    title: schedule?.title ?? "",
  };
}

function buildSchedulePayload(form: ScheduleFormState): SchedulePayload {
  return {
    conversationId: form.conversationId.trim() || undefined,
    dateTime: buildIsoFromLocalDateTime(form.dateTime),
    investeeId: form.investeeId.trim() || undefined,
    investorId: form.investorId.trim() || undefined,
    location: form.location.trim(),
    timeZone: form.timeZone.trim(),
    title: form.title.trim(),
  };
}

function getAudienceSubtitle(audience: ScheduleAudience) {
  if (audience === "superadmin") {
    return "Review every scheduled investor-investee meeting";
  }

  if (audience === "investee") {
    return "Review meetings scheduled with investors";
  }

  return "Review meetings scheduled with founders";
}

function formatParticipant(user?: Schedule["investor"]) {
  if (!user) {
    return "Not assigned";
  }

  return user.name?.trim() || user.email?.trim() || "Not assigned";
}

export function SchedulePage({ audience = "investor" }: SchedulePageProps) {
  const searchParams = useSearchParams();
  const isSuperadmin = audience === "superadmin";
  const selectedScheduleId = searchParams.get("scheduleId") ?? "";
  const initialSelectedDate = useMemo(() => new Date(), []);
  const [displayedMonth, setDisplayedMonth] = useState(
    new Date(initialSelectedDate.getFullYear(), initialSelectedDate.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [modalOpen, setModalOpen] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleDetailError, setScheduleDetailError] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [loadingScheduleDetails, setLoadingScheduleDetails] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null);
  const [scheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [scheduleFormMode, setScheduleFormMode] = useState<ScheduleFormMode>("create");
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormState>(() =>
    createScheduleFormState(getDateWithSlot(initialSelectedDate)),
  );
  const [editingScheduleId, setEditingScheduleId] = useState("");
  const [scheduleFormError, setScheduleFormError] = useState("");
  const [scheduleFormSaving, setScheduleFormSaving] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const refreshSchedules = useCallback(async () => {
    const monthRange = getMonthRange(displayedMonth);

    setLoadingSchedules(true);
    setScheduleError("");

    try {
      const response = await getSchedules(monthRange);
      const items = Array.isArray(response.data) ? response.data : [];

      setSchedules(items);

      const firstSchedule = items.find((item) => getScheduleStart(item));
      setSelectedDate((currentDate) => {
        const currentDateIsInDisplayedMonth =
          currentDate.getFullYear() === displayedMonth.getFullYear() &&
          currentDate.getMonth() === displayedMonth.getMonth();

        if (!currentDateIsInDisplayedMonth) {
          return new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
        }

        if (!firstSchedule) {
          return currentDate;
        }

        const startsAt = new Date(getScheduleStart(firstSchedule) ?? "");

        if (Number.isNaN(startsAt.getTime()) || isSameDay(currentDate, startsAt)) {
          return currentDate;
        }

        return startsAt;
      });
    } catch (error) {
      setScheduleError(getApiErrorMessage(error, "Unable to load schedules."));
    } finally {
      setLoadingSchedules(false);
    }
  }, [displayedMonth]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshSchedules();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshSchedules]);

  useEffect(() => {
    if (!selectedScheduleId) {
      return;
    }

    let active = true;

    const openSelectedSchedule = async () => {
      setScheduleDetailError("");
      setLoadingScheduleDetails(true);

      try {
        const response = await getSchedule(selectedScheduleId);
        const schedule = response.data;

        if (!active || !schedule) {
          return;
        }

        const scheduleStart = getScheduleStart(schedule);
        const scheduleDate = scheduleStart ? new Date(scheduleStart) : null;

        if (scheduleDate && !Number.isNaN(scheduleDate.getTime())) {
          setSelectedDate(scheduleDate);
          setDisplayedMonth(new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), 1));
        }

        setActiveSchedule(schedule);
        setModalOpen(true);
      } catch (error) {
        if (active) {
          setScheduleDetailError(getApiErrorMessage(error, "Unable to load schedule details."));
          setModalOpen(true);
        }
      } finally {
        if (active) {
          setLoadingScheduleDetails(false);
        }
      }
    };

    void openSelectedSchedule();

    return () => {
      active = false;
    };
  }, [selectedScheduleId]);

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

  const timeSlots = useMemo(() => {
    const scheduleSlots = schedules.map((schedule) => formatSlotTime(getScheduleStart(schedule))).filter(Boolean);
    return Array.from(new Set([...dashboardCalendarSlots, ...scheduleSlots])).sort(
      (left, right) => getTimeSlotMinutes(left) - getTimeSlotMinutes(right),
    );
  }, [schedules]);

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + offset, 1);
    const day = Math.min(selectedDate.getDate(), getDaysInMonth(nextMonth));

    setDisplayedMonth(nextMonth);
    setSelectedDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day));
  };

  const openScheduleModal = async (date: Date, schedule: Schedule) => {
    setSelectedDate(date);
    setActiveSchedule(schedule);
    setScheduleDetailError("");
    setModalOpen(true);

    if (!schedule._id) {
      return;
    }

    setLoadingScheduleDetails(true);

    try {
      const response = await getSchedule(schedule._id);
      setActiveSchedule(response.data ?? schedule);
    } catch (error) {
      setScheduleDetailError(getApiErrorMessage(error, "Unable to load schedule details."));
    } finally {
      setLoadingScheduleDetails(false);
    }
  };

  const openCreateScheduleForm = (date = selectedDate, slot?: string) => {
    const formDate = getDateWithSlot(date, slot);

    setScheduleFormMode("create");
    setEditingScheduleId("");
    setScheduleForm(createScheduleFormState(formDate));
    setScheduleFormError("");
    setScheduleFormOpen(true);
  };

  const openEditScheduleForm = (schedule: Schedule | null) => {
    if (!schedule?._id) {
      return;
    }

    const start = getScheduleStart(schedule);
    const fallbackDate = start ? new Date(start) : selectedDate;

    setScheduleFormMode("edit");
    setEditingScheduleId(schedule._id);
    setScheduleForm(createScheduleFormState(fallbackDate, schedule));
    setScheduleFormError("");
    setScheduleFormOpen(true);
  };

  const updateScheduleFormField = (field: keyof ScheduleFormState, value: string) => {
    setScheduleForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submitScheduleForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSuperadmin || scheduleFormSaving) {
      return;
    }

    const payload = buildSchedulePayload(scheduleForm);

    if (!payload.title || !payload.dateTime || !payload.timeZone || !payload.location) {
      setScheduleFormError("Title, date and time, time zone, and location are required.");
      return;
    }

    if (!payload.conversationId && (!payload.investorId || !payload.investeeId)) {
      setScheduleFormError("Provide a conversation ID or both participant user IDs.");
      return;
    }

    setScheduleFormSaving(true);
    setScheduleFormError("");

    try {
      const response =
        scheduleFormMode === "edit" && editingScheduleId
          ? await updateSchedule(editingScheduleId, payload)
          : await createSchedule(payload);

      const savedSchedule = response.data;

      if (savedSchedule?._id) {
        setActiveSchedule(savedSchedule);
      }

      setScheduleFormOpen(false);

      const savedStart = getScheduleStart(savedSchedule ?? ({} as Schedule)) || payload.dateTime;
      const savedDate = savedStart ? new Date(savedStart) : null;
      let shouldRefreshCurrentMonth = true;

      if (savedDate && !Number.isNaN(savedDate.getTime())) {
        setSelectedDate(savedDate);

        if (
          savedDate.getFullYear() !== displayedMonth.getFullYear() ||
          savedDate.getMonth() !== displayedMonth.getMonth()
        ) {
          setDisplayedMonth(new Date(savedDate.getFullYear(), savedDate.getMonth(), 1));
          shouldRefreshCurrentMonth = false;
        }
      }

      if (shouldRefreshCurrentMonth) {
        await refreshSchedules();
      }
    } catch (error) {
      setScheduleFormError(getApiErrorMessage(error, "Unable to save schedule."));
    } finally {
      setScheduleFormSaving(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!isSuperadmin || !activeSchedule?._id || deleteSaving) {
      return;
    }

    const confirmed = window.confirm("Delete this schedule?");

    if (!confirmed) {
      return;
    }

    setDeleteSaving(true);
    setScheduleDetailError("");

    try {
      await deleteSchedule(activeSchedule._id);
      setModalOpen(false);
      setActiveSchedule(null);
      await refreshSchedules();
    } catch (error) {
      setScheduleDetailError(getApiErrorMessage(error, "Unable to delete schedule."));
    } finally {
      setDeleteSaving(false);
    }
  };

  const activeScheduleStart = getScheduleStart(activeSchedule ?? ({} as Schedule));
  const activeScheduleDate = activeScheduleStart ? new Date(activeScheduleStart) : selectedDate;
  const activeTimeLabel = [formatSlotTime(activeScheduleStart), formatSlotTime(activeSchedule?.endsAt)]
    .filter(Boolean)
    .join(" - ");

  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Schedule" subtitle={getAudienceSubtitle(audience)} />

      <div className="rounded-[30px] border border-[#E6EBF3] bg-white p-5 shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)] xl:p-7">
        {scheduleError ? (
          <div className="mb-5 rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
            {scheduleError}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-4">
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

          {isSuperadmin ? (
            <button
              type="button"
              onClick={() => openCreateScheduleForm()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#314B6B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#263A53]"
            >
              <DashboardIcon name="plus" className="h-4 w-4" />
              New schedule
            </button>
          ) : null}
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[#475467]">
                  {formatMonthLabel(displayedMonth)}
                  <DashboardIcon name="chevronDown" className="h-4 w-4" />
                </span>
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
                    const scheduleStart = getScheduleStart(schedule);

                    if (!scheduleStart) {
                      return false;
                    }

                    const startsAt = new Date(scheduleStart);
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

              {timeSlots.map((slot, rowIndex) => (
                <div key={slot} className="contents">
                  <div className="flex items-center text-xs font-medium text-[#475467]">{slot}</div>
                  {weekDates.map((date, columnIndex) => {
                    const schedule = schedules.find((item) => isScheduleOnSlot(item, date, slot)) ?? null;

                    return (
                      <button
                        key={`${slot}-${date.toISOString()}`}
                        type="button"
                        onClick={() => {
                          setSelectedDate(date);

                          if (schedule) {
                            void openScheduleModal(date, schedule);
                          } else if (isSuperadmin) {
                            openCreateScheduleForm(date, slot);
                          }
                        }}
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
          <div className="w-full max-w-[480px] rounded-[18px] bg-white p-[24px] shadow-2xl">
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
              <div>
                <h2 className="text-lg font-semibold text-[#1E2746]">
                  {activeSchedule?.title || "Scheduled meeting"}
                </h2>
                {loadingScheduleDetails ? <p className="mt-1 text-xs text-[#6B7280]">Loading details...</p> : null}
                {scheduleDetailError ? <p className="mt-1 text-xs text-[#B42318]">{scheduleDetailError}</p> : null}
              </div>

              <div className="inline-flex items-center gap-2 text-sm text-[#1F2937]">
                <DashboardIcon name="schedule"  className="h-[24px] w-[24px]" />
                {formatModalDate(activeScheduleDate)}
              </div>

              <div className="rounded-[12px] bg-[#F4F6FB] px-3 py-2 text-sm text-[#1F2937]">
                {activeTimeLabel || formatDateTime(activeScheduleStart) || "Time not provided"}
              </div>

              <div className="inline-flex items-center gap-2 text-sm text-[#1F2937]">
                <HugeiconsIcon icon={Location05Icon} className="h-[24px] w-[24px]" />
                {activeSchedule?.location || "Location not provided"}
              </div>

              {activeSchedule?.locationDetails ? (
                <p className="rounded-[12px] bg-[#F4F6FB] px-3 py-2 text-sm text-[#475467]">
                  {activeSchedule.locationDetails}
                </p>
              ) : null}

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-[12px] border border-[#E6EBF3] px-3 py-2">
                  <p className="text-xs text-[#6B7280]">Investor</p>
                  <p className="mt-1 font-medium text-[#1E2746]">{formatParticipant(activeSchedule?.investor)}</p>
                </div>
                <div className="rounded-[12px] border border-[#E6EBF3] px-3 py-2">
                  <p className="text-xs text-[#6B7280]">Investee</p>
                  <p className="mt-1 font-medium text-[#1E2746]">{formatParticipant(activeSchedule?.investee)}</p>
                </div>
              </div>

              <p className="text-xs text-[#6B7280]">
                Time zone: {activeSchedule?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"}
              </p>

              {isSuperadmin ? (
                <div className="flex justify-end gap-3 border-t border-[#E6EBF3] pt-4">
                  <button
                    type="button"
                    onClick={() => openEditScheduleForm(activeSchedule)}
                    className="rounded-[10px] border border-[#D5DCE8] px-4 py-2 text-sm font-semibold text-[#314B6B]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteSchedule()}
                    disabled={deleteSaving}
                    className="rounded-[10px] border border-[#FECACA] px-4 py-2 text-sm font-semibold text-[#B42318] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleteSaving ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {scheduleFormOpen && isSuperadmin ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/35 p-4">
          <form
            onSubmit={submitScheduleForm}
            className="w-full max-w-[560px] rounded-[18px] bg-white p-[24px] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#1E2746]">
                  {scheduleFormMode === "edit" ? "Edit schedule" : "New schedule"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setScheduleFormOpen(false)}
                className="inline-flex h-[24px] w-[24px] items-center justify-center text-[#111827]"
                aria-label="Close schedule form"
              >
                <HugeiconsIcon icon={Cancel01Icon} />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="text-xs font-medium text-[#475467]">Title</span>
                <input
                  value={scheduleForm.title}
                  onChange={(event) => updateScheduleFormField("title", event.target.value)}
                  maxLength={200}
                  className="mt-1 w-full rounded-[12px] border border-[#D5DCE8] px-3 py-2 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                />
              </label>

              <label>
                <span className="text-xs font-medium text-[#475467]">Date and time</span>
                <input
                  type="datetime-local"
                  value={scheduleForm.dateTime}
                  onChange={(event) => updateScheduleFormField("dateTime", event.target.value)}
                  className="mt-1 w-full rounded-[12px] border border-[#D5DCE8] px-3 py-2 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                />
              </label>

              <label>
                <span className="text-xs font-medium text-[#475467]">Time zone</span>
                <input
                  value={scheduleForm.timeZone}
                  onChange={(event) => updateScheduleFormField("timeZone", event.target.value)}
                  className="mt-1 w-full rounded-[12px] border border-[#D5DCE8] px-3 py-2 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="text-xs font-medium text-[#475467]">Location</span>
                <input
                  value={scheduleForm.location}
                  onChange={(event) => updateScheduleFormField("location", event.target.value)}
                  maxLength={200}
                  className="mt-1 w-full rounded-[12px] border border-[#D5DCE8] px-3 py-2 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                />
              </label>

              <label>
                <span className="text-xs font-medium text-[#475467]">Investor ID</span>
                <input
                  value={scheduleForm.investorId}
                  onChange={(event) => updateScheduleFormField("investorId", event.target.value)}
                  className="mt-1 w-full rounded-[12px] border border-[#D5DCE8] px-3 py-2 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                />
              </label>

              <label>
                <span className="text-xs font-medium text-[#475467]">Investee ID</span>
                <input
                  value={scheduleForm.investeeId}
                  onChange={(event) => updateScheduleFormField("investeeId", event.target.value)}
                  className="mt-1 w-full rounded-[12px] border border-[#D5DCE8] px-3 py-2 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="text-xs font-medium text-[#475467]">Conversation ID</span>
                <input
                  value={scheduleForm.conversationId}
                  onChange={(event) => updateScheduleFormField("conversationId", event.target.value)}
                  className="mt-1 w-full rounded-[12px] border border-[#D5DCE8] px-3 py-2 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                />
              </label>
            </div>

            {scheduleFormError ? <p className="mt-4 text-sm text-[#B42318]">{scheduleFormError}</p> : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setScheduleFormOpen(false)}
                className="rounded-[10px] border border-[#D5DCE8] px-4 py-2 text-sm font-semibold text-[#314B6B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={scheduleFormSaving}
                className="rounded-[10px] bg-[#314B6B] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {scheduleFormSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
