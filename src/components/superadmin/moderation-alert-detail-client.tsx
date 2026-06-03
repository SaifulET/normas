"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import {
  approveModerationPost,
  deleteModerationPost,
  getModerationAlert,
  keepModerationPostSuspended,
  markModerationAlertReviewed,
  suspendModerationUser,
  type ModerationAlert,
  warnModerationUser,
} from "@/lib/moderation-api";
import { SuperadminBackLink, SuperadminNotificationButton, SuperadminStatusBadge } from "./shell";

function formatDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function humanize(value?: string) {
  return (value || "alert").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getCaseTitle(alert: ModerationAlert) {
  if (alert.type === "chat_contact_details") {
    return "Restricted chat message";
  }

  if (alert.list?._id) {
    return "Pitch moderation review";
  }

  return humanize(alert.type);
}

function getCaseSummary(alert: ModerationAlert) {
  if (alert.type === "chat_contact_details") {
    return "A message was saved for audit, hidden from the receiver, and sent to superadmin review.";
  }

  if (alert.list?._id) {
    return "A pitch was held for superadmin review because moderation found possible policy issues.";
  }

  return "This item needs superadmin review.";
}

function getPrimaryUser(alert: ModerationAlert) {
  return alert.sender ?? alert.user ?? null;
}

function getSecondaryUser(alert: ModerationAlert) {
  return alert.receiver ?? null;
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="rounded-[10px] border border-[#E6EAF2] bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A91AB]">{label}</p>
      <div className="mt-2 text-sm font-medium text-[#202350]">{value || "Not available"}</div>
    </div>
  );
}

function UserBlock({
  label,
  user,
}: {
  label: string;
  user: ReturnType<typeof getPrimaryUser>;
}) {
  return (
    <div className="rounded-[12px] border border-[#E6EAF2] bg-white px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A91AB]">{label}</p>
      <p className="mt-3 text-sm font-semibold text-[#202350]">{user?.name || "Unknown user"}</p>
      <p className="mt-1 break-words text-xs text-[#667085]">{user?.email || "No email"}</p>
      <p className="mt-2 text-xs capitalize text-[#8A91AB]">{user?.role || ""}</p>
    </div>
  );
}

export function ModerationAlertDetailClient({ alertId }: { alertId: string }) {
  const [alert, setAlert] = useState<ModerationAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const primaryUser = alert ? getPrimaryUser(alert) : null;
  const secondaryUser = alert ? getSecondaryUser(alert) : null;
  const postHref = alert?.list?._id ? `/superadmin/dashboard/pitch/${alert.list._id}` : "";
  const messageHref = alert?.conversation
    ? `/superadmin/dashboard/messages?conversationId=${encodeURIComponent(String(alert.conversation))}${alert.messageId ? `&messageId=${encodeURIComponent(String(alert.messageId))}` : ""}`
    : "";
  const reasons = useMemo(() => alert?.detectedReasons ?? [], [alert]);

  const loadAlert = async () => {
    setLoading(true);

    try {
      const response = await getModerationAlert(alertId);
      setAlert(response.data ?? null);
      setError("");
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load moderation alert."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAlert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertId]);

  const runAction = async (label: string, action: (id: string, note?: string) => Promise<unknown>) => {
    if (saving) {
      return;
    }

    setSaving(label);
    setError("");

    try {
      await action(alertId, note.trim() || undefined);
      setNote("");
      await loadAlert();
    } catch (actionError) {
      setError(getApiErrorMessage(actionError, "Unable to update moderation alert."));
    } finally {
      setSaving("");
    }
  };

  if (loading) {
    return (
      <section className="rounded-[14px] border border-[#E6E9F0] bg-white px-6 py-12 text-center text-sm text-[#667085]">
        Loading moderation alert...
      </section>
    );
  }

  if (!alert) {
    return (
      <section className="space-y-5">
        <SuperadminBackLink href="/superadmin/dashboard/moderation" />
        <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
          {error || "Moderation alert not found."}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <SuperadminBackLink href="/superadmin/dashboard/moderation" />
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.04em] text-[#202350]">Moderation Case</h1>
            <p className="mt-1 text-[13px] text-[#69729A]">Review the flagged content, reason, people, and final action history.</p>
          </div>
        </div>
        <SuperadminNotificationButton />
      </div>

      {error ? (
        <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="rounded-[14px] border border-[#E6E9F0] bg-white px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <SuperadminStatusBadge status={alert.status || "pending"} />
                  <span className="text-xs text-[#8A91AB]">{formatDate(alert.createdAt)}</span>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-[#202350]">{getCaseTitle(alert)}</h2>
                <p className="mt-1 text-sm text-[#69729A]">{getCaseSummary(alert)}</p>
              </div>
              {postHref || messageHref ? (
                <Link href={postHref || messageHref} className="inline-flex h-9 items-center rounded-[8px] bg-[#2B425D] px-4 text-xs font-semibold text-white">
                  {postHref ? "Open reviewed pitch" : "Open flagged message"}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="rounded-[14px] border border-[#E6E9F0] bg-white px-5 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A91AB]">{alert.list ? "Reviewed pitch" : "Flagged message"}</p>
            {alert.list ? (
              <div className="mt-4 space-y-4">
                <h3 className="text-xl font-semibold text-[#202350]">{alert.list.title || "Untitled pitch"}</h3>
                <div className="flex flex-wrap gap-2">
                  {[alert.list.stage, alert.list.sector, alert.list.status].filter(Boolean).map((item) => (
                    <span key={item} className="rounded-full bg-[#EDF2F7] px-3 py-1 text-xs font-medium text-[#586274]">
                      {item}
                    </span>
                  ))}
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#4B5563]">
                  {alert.list.description || alert.message || "No description provided."}
                </p>
              </div>
            ) : (
              <p className="mt-4 whitespace-pre-wrap break-words rounded-[12px] bg-[#F8FAFC] px-4 py-4 text-sm leading-7 text-[#3F4863]">
                {alert.message || "No message body provided."}
              </p>
            )}
          </div>

          <div className="rounded-[14px] border border-[#E6E9F0] bg-white px-5 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A91AB]">Detected Reasons</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {reasons.length ? reasons.map((reason) => (
                <span key={reason} className="rounded-full bg-[#FFF2E5] px-3 py-1.5 text-xs font-medium text-[#B45309]">
                  {reason}
                </span>
              )) : (
                <span className="text-sm text-[#667085]">No reasons recorded.</span>
              )}
            </div>
          </div>

          <div className="rounded-[14px] border border-[#E6E9F0] bg-white px-5 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A91AB]">Action History</p>
            <div className="mt-4 space-y-3">
              {(alert.actions ?? []).length ? (alert.actions ?? []).map((action, index) => (
                <div key={`${action.action}-${index}`} className="rounded-[10px] bg-[#F8FAFC] px-4 py-3">
                  <p className="text-sm font-semibold text-[#202350]">{humanize(action.action)}</p>
                  <p className="mt-1 text-xs text-[#8A91AB]">{formatDate(action.createdAt)}</p>
                  {action.note ? <p className="mt-2 text-sm text-[#4B5563]">{action.note}</p> : null}
                </div>
              )) : (
                <p className="text-sm text-[#667085]">No action history yet.</p>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <UserBlock label={alert.sender ? "Sender" : "User"} user={primaryUser} />
          {secondaryUser ? <UserBlock label="Receiver" user={secondaryUser} /> : null}

          <div className="grid gap-3">
            {messageHref ? (
              <Link
                href={messageHref}
                className="rounded-[10px] border border-[#DDE3ED] bg-white px-4 py-3 text-sm font-semibold text-[#314B6B] transition hover:bg-[#F8FAFC]"
              >
                Open flagged message in chat
                <span className="mt-1 block text-xs font-normal text-[#69729A]">
                  Opens the conversation and highlights the restricted message when available.
                </span>
              </Link>
            ) : null}
            <DetailField label="Case type" value={getCaseTitle(alert)} />
            <DetailField label="Review status" value={humanize(alert.status)} />
            <DetailField label="Reviewed at" value={formatDate(alert.reviewedAt)} />
          </div>

          <div className="rounded-[14px] border border-[#E6E9F0] bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A91AB]">Superadmin note</p>
            <p className="mt-2 text-xs leading-5 text-[#69729A]">
              This note will be sent to the user when you send a warning.
            </p>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-3 h-24 w-full resize-none rounded-[10px] border border-[#DDE3ED] px-3 py-2 text-sm text-[#20243A] outline-none focus:border-[#314B6B]"
              placeholder="Write the warning message for this user"
            />
            <button
              type="button"
              onClick={() => void runAction("warn-user", warnModerationUser)}
              disabled={Boolean(saving)}
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-[8px] bg-[#2B425D] px-3 text-xs font-semibold text-white transition hover:bg-[#24384F] disabled:opacity-60"
            >
              {saving === "warn-user" ? "Sending warning..." : "Send warning"}
            </button>

            <div className="mt-5 border-t border-[#EEF1F6] pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A91AB]">Other actions</p>
              <div className="mt-3 flex flex-wrap gap-2">
              {alert.list?._id ? (
                <>
                  <button
                    type="button"
                    onClick={() => void runAction("approve", approveModerationPost)}
                    disabled={Boolean(saving)}
                    className="h-9 rounded-[8px] bg-[#D6F8E3] px-3 text-xs font-semibold text-[#0F7A49] disabled:opacity-60"
                  >
                    {saving === "approve" ? "Saving..." : "Approve post"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void runAction("suspend-post", keepModerationPostSuspended)}
                    disabled={Boolean(saving)}
                    className="h-9 rounded-[8px] bg-[#FFF2E5] px-3 text-xs font-semibold text-[#B45309] disabled:opacity-60"
                  >
                    Keep suspended
                  </button>
                  <button
                    type="button"
                    onClick={() => void runAction("delete-post", deleteModerationPost)}
                    disabled={Boolean(saving)}
                    className="h-9 rounded-[8px] bg-[#FEE2E2] px-3 text-xs font-semibold text-[#B42318] disabled:opacity-60"
                  >
                    Delete post
                  </button>
                </>
              ) : null}
              <button
                type="button"
                onClick={() => void runAction("suspend-user", suspendModerationUser)}
                disabled={Boolean(saving)}
                className="h-9 rounded-[8px] border border-[#FECACA] px-3 text-xs font-semibold text-[#B42318] disabled:opacity-60"
              >
                Suspend user
              </button>
              <button
                type="button"
                onClick={() => void runAction("reviewed", markModerationAlertReviewed)}
                disabled={Boolean(saving)}
                className="h-9 rounded-[8px] bg-[#2B425D] px-3 text-xs font-semibold text-white disabled:opacity-60"
              >
                Mark reviewed
              </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
