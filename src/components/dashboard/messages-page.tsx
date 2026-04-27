"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { getPitchBySlug } from "@/components/pitch/data";
import { dashboardMessageThreads } from "./data";
import { DashboardIcon } from "./icons";
import { DashboardPageHeader } from "./page-header";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const scheduleDays = ["S", "M", "T", "W", "T", "F", "S"];
const scheduleDates = Array.from({ length: 31 }, (_, index) => index + 1);

export function MessagesPage() {
  const pathname = usePathname();
  const [selectedId, setSelectedId] = useState(dashboardMessageThreads[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [sentMessages, setSentMessages] = useState<Record<string, string[]>>({});
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [availability, setAvailability] = useState<"available" | "not-available">("available");
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("AM");

  const selectedThread = useMemo(
    () => dashboardMessageThreads.find((thread) => thread.id === selectedId) ?? dashboardMessageThreads[0],
    [selectedId],
  );

  const selectedPitch = selectedThread ? getPitchBySlug(selectedThread.pitchSlug) : undefined;
  const extraMessages = sentMessages[selectedId] ?? [];
  const dashboardBase = pathname.startsWith("/investee-dashboard") ? "/investee-dashboard" : "/dashboard";

  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Message" subtitle="See all messages in here" />

      <div className="overflow-hidden rounded-[28px] border border-[#E6EBF3] bg-white shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)]">
        <div className="grid h-[calc(100vh-9.5rem)] min-h-[720px] lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col border-b border-[#EEF2F7] bg-[#FBFCFE] lg:border-b-0 lg:border-r">
            <div className="border-b border-[#EEF2F7] px-4 py-4">
              <div className="grid grid-cols-3 rounded-2xl bg-[#F1F4F9] p-1 text-xs font-medium text-[#6B7280]">
                <span className="rounded-xl bg-white px-3 py-2 text-center text-[#1E2746] shadow-sm">All</span>
                <span className="px-3 py-2 text-center">Open (12)</span>
                <span className="px-3 py-2 text-center">Request</span>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {dashboardMessageThreads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setSelectedId(thread.id)}
                  className={cx(
                    "flex w-full items-start gap-3 border-b border-[#EEF2F7] px-4 py-4 text-left transition",
                    selectedId === thread.id ? "bg-white" : "hover:bg-white/70",
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="line-clamp-1 text-sm font-semibold text-[#1E2746]">{thread.title}</p>
                      <div className="flex items-center gap-2">
                        {thread.unreadCount ? (
                          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4F46E5] px-1.5 text-[10px] font-semibold text-white">
                            {thread.unreadCount}
                          </span>
                        ) : null}
                        <span className="text-[11px] text-[#8A94A6]">{thread.age}</span>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#7B8496]">{thread.preview}</p>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <div className="flex min-h-0 min-w-0 flex-col">
            {selectedThread && selectedPitch ? (
              <>
                <div className="border-b border-[#EEF2F7] px-4 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-[#1E2746]">{selectedPitch.title}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#7B8496]">
                        <span>{selectedPitch.location}</span>
                        <span>{selectedPitch.views} views</span>
                        <Link
                          href={`/preview-pitch/${selectedPitch.slug}`}
                          className="inline-flex items-center rounded-xl bg-[#F2F5FA] px-3 py-1.5 font-medium text-[#314B6B] transition hover:bg-[#E7EDF6]"
                        >
                          Preview Pitch
                        </Link>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#D8E0EC] px-3 py-1 text-[11px] font-medium text-[#314B6B]">
                          {selectedPitch.stage}
                        </span>
                        <span className="rounded-full bg-[#EDF2F7] px-3 py-1 text-[11px] font-medium text-[#586274]">
                          {selectedPitch.sector}
                        </span>
                        <span className="text-xs text-[#7B8496]">Funding target</span>
                        <span className="text-sm font-semibold text-[#243B5A]">{selectedPitch.target}</span>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-2xl border border-[#E7ECF3] bg-[#F8FAFC] px-3 py-2 text-xs text-[#6B7280]">
                      <DashboardIcon name="spark" className="h-4 w-4 text-[#ED6A06]" />
                      Internal communications alongside your client conversation
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  {selectedThread.messages.length || extraMessages.length ? (
                    <div className="space-y-4">
                      {selectedThread.messages.map((message) => (
                        <div
                          key={message.id}
                          className={cx(
                            "max-w-[440px] rounded-[24px] border px-4 py-4 shadow-sm",
                            message.sender === "investor"
                              ? "ml-auto border-[#F2C7C7] bg-[#FFF7F7]"
                              : "border-[#E6EBF3] bg-[#F8F5EE]",
                          )}
                        >
                          <p className="text-sm font-semibold text-[#1E2746]">{message.author}</p>
                          <p className="mt-2 text-sm leading-6 text-[#475467]">{message.body}</p>
                          {message.actionLabel ? (
                            <div className="mt-4 rounded-2xl bg-white px-4 py-3">
                              <p className="text-sm font-semibold text-[#1E2746]">{message.actionLabel}</p>
                              <p className="mt-1 text-xs text-[#7B8496]">{message.actionHint}</p>
                            </div>
                          ) : null}
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-[11px] text-[#98A2B3]">{message.time}</span>
                            <span className="text-[#98A2B3]">✓</span>
                          </div>
                          {message.warning ? (
                            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#EF4444]">
                              {message.warning}
                            </p>
                          ) : null}
                        </div>
                      ))}

                      {extraMessages.map((message) => (
                        <div
                          key={message}
                          className="ml-auto max-w-[420px] rounded-[24px] border border-[#DCE7F3] bg-white px-4 py-4 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-[#1E2746]">{dashboardMessageThreads[0].title}</p>
                          <p className="mt-2 text-sm leading-6 text-[#475467]">{message}</p>
                          <div className="mt-3 text-[11px] text-[#98A2B3]">Just now</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F4F6FB] text-[#314B6B]">
                        <DashboardIcon name="messages" className="h-10 w-10" />
                      </div>
                      <p className="mt-5 max-w-sm text-base text-[#475467]">
                        Start conversation with the party from here and keep all pitch discussion inside the dashboard.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#EEF2F7] bg-white px-4 py-4 sm:px-6">
                  <div className="rounded-[26px] border border-[#E7ECF3] bg-[#FBFCFE] p-3 shadow-[0_-8px_24px_-20px_rgba(30,39,70,0.3)]">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Type here..."
                      className="h-28 w-full resize-none rounded-2xl border-0 bg-transparent px-3 py-2 text-sm text-[#1E2746] outline-none placeholder:text-[#98A2B3]"
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setScheduleOpen(true)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#DEE6F1] text-[#314B6B] transition hover:bg-[#F4F7FB]"
                        aria-label="Open schedule"
                      >
                        <DashboardIcon name="calendar" className="h-4 w-4" />
                      </button>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`${dashboardBase}/upgrade-plan`}
                          className="inline-flex h-10 items-center justify-center rounded-xl bg-[#ED6A06] px-4 text-sm font-semibold text-white transition hover:bg-[#d35f05]"
                        >
                          Ready to invest
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            if (!draft.trim()) return;

                            setSentMessages((current) => ({
                              ...current,
                              [selectedId]: [...(current[selectedId] ?? []), draft.trim()],
                            }));
                            setDraft("");
                          }}
                          className="inline-flex h-10 items-center justify-center rounded-xl bg-[#314B6B] px-4 text-sm font-semibold text-white transition hover:bg-[#243B5A]"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {scheduleOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/35 p-4"
          onClick={() => setScheduleOpen(false)}
        >
          <div
            className="w-full max-w-[336px] rounded-[28px] bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[1.8rem] font-semibold tracking-[-0.04em] text-[#1E2746]">View Schedule</h2>
              <button
                type="button"
                onClick={() => setScheduleOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6B7280] transition hover:bg-[#F3F5F8]"
                aria-label="Close schedule modal"
              >
                ×
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-[#475467]">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-3 w-3 items-center justify-center rounded-full border border-[#ED6A06]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ED6A06]" />
                </span>
                Confirm meeting
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ED6A06]" />
                Meeting
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#6B7280]" />
                Current Date
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button type="button" className="inline-flex items-center gap-2 text-sm font-medium text-[#1E2746]">
                August 2026
                <DashboardIcon name="chevronDown" className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#1E2746] transition hover:bg-[#F3F5F8]"
                >
                  <DashboardIcon name="chevronLeft" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#1E2746] transition hover:bg-[#F3F5F8] [transform:rotate(180deg)]"
                >
                  <DashboardIcon name="chevronLeft" className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="mt-4 text-[2.1rem] font-medium tracking-[-0.05em] text-[#111827]">Mon, Aug 17</p>

            <div className="mt-5 border-t border-[#E5EAF2] pt-4">
              <div className="grid grid-cols-7 text-center text-sm text-[#1F2937]">
                {scheduleDays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-7 gap-y-5 text-center text-sm text-[#1F2937]">
                {scheduleDates.map((day) => {
                  const outlined = day === 4 || day === 5;
                  const current = day === 17;
                  const confirmed = day === 19;

                  return (
                    <div key={day} className="flex justify-center">
                      <span
                        className={cx(
                          "relative flex h-8 w-8 items-center justify-center rounded-full",
                          outlined && "border border-[#35527A] text-[#ED6A06]",
                          current && "bg-[#E5E7EB] font-medium text-[#1F2937]",
                          confirmed && "text-[#ED6A06]",
                        )}
                      >
                        {day}
                        {confirmed ? (
                          <span className="absolute -bottom-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-[#ED6A06]" />
                        ) : null}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-7 space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#9CA3AF]">Time</p>
                <div className="mt-2 grid grid-cols-[minmax(0,1fr)_88px] gap-3">
                  <div className="flex h-11 items-center gap-2 rounded-2xl border border-[#98A2B3] px-4 text-sm text-[#475467]">
                    <DashboardIcon name="schedule" className="h-4 w-4" />
                    10:00 AM
                  </div>
                  <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#98A2B3]">
                    {(["AM", "PM"] as const).map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setStartPeriod(period)}
                        className={cx(
                          "text-sm font-medium transition",
                          startPeriod === period ? "bg-[#314B6B] text-white" : "bg-white text-[#1F2937]",
                        )}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#9CA3AF]">Time</p>
                <div className="mt-2 grid grid-cols-[minmax(0,1fr)_88px] gap-3">
                  <div className="flex h-11 items-center gap-2 rounded-2xl border border-[#98A2B3] px-4 text-sm text-[#475467]">
                    <DashboardIcon name="schedule" className="h-4 w-4" />
                    10:00 AM
                  </div>
                  <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#98A2B3]">
                    {(["AM", "PM"] as const).map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setEndPeriod(period)}
                        className={cx(
                          "text-sm font-medium transition",
                          endPeriod === period ? "bg-[#314B6B] text-white" : "bg-white text-[#1F2937]",
                        )}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAvailability("not-available")}
                className={cx(
                  "inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-medium transition",
                  availability === "not-available"
                    ? "bg-[#E5E7EB] text-[#6B7280]"
                    : "bg-[#F3F4F6] text-[#6B7280]",
                )}
              >
                × Not Available
              </button>
              <button
                type="button"
                onClick={() => setAvailability("available")}
                className={cx(
                  "inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-medium transition",
                  availability === "available" ? "bg-[#ED6A06] text-white" : "bg-[#FFE8D5] text-[#ED6A06]",
                )}
              >
                ✓ Available
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
