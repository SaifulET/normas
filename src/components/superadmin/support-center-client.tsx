"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import {
  getSupportConversation,
  getSupportConversations,
  sendSupportMessage,
  updateSupportConversationStatus,
  type SupportConversation,
  type SupportConversationListItem,
  type SupportMessage,
} from "@/lib/support-api";
import {
  SuperadminAvatar,
  SuperadminBackLink,
  SuperadminNotificationButton,
  SuperadminPageHeader,
  SuperadminStatusBadge,
} from "./shell";

function formatDate(value?: string) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function normalizeSupportStatus(status?: string) {
  switch ((status || "").toLowerCase()) {
    case "resolved":
      return "Solved";
    case "dismissed":
      return "Dismissed";
    default:
      return "Pending";
  }
}

function statusForApi(status: "All" | "Dismissed" | "Pending" | "Solved") {
  switch (status) {
    case "Dismissed":
      return "dismissed";
    case "Solved":
      return "resolved";
    case "Pending":
      return "pending";
    default:
      return "";
  }
}

function getInitials(name?: string, email?: string) {
  const value = name?.trim() || email?.trim() || "Support User";
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "SU";
}

function getConversationParticipant(conversation: SupportConversation) {
  if (conversation.user && typeof conversation.user === "object") {
    return {
      email: conversation.user.email || conversation.guestEmail || "",
      name: conversation.user.name || conversation.guestName || "Support user",
      role: conversation.user.role || "user",
    };
  }

  return {
    email: conversation.guestEmail || "",
    name: conversation.guestName || "Guest user",
    role: "guest",
  };
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function SupportStatusSelect({
  value,
  onChange,
}: {
  value: "All" | "Dismissed" | "Pending" | "Solved";
  onChange: (value: "All" | "Dismissed" | "Pending" | "Solved") => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as "All" | "Dismissed" | "Pending" | "Solved")}
      className="h-9 rounded-[8px] border border-[#DDE2EC] bg-white px-3 text-[12px] text-[#525B79] outline-none"
    >
      <option>All</option>
      <option>Pending</option>
      <option>Solved</option>
      <option>Dismissed</option>
    </select>
  );
}

function messageSenderLabel(message: SupportMessage) {
  if (message.senderType === "superadmin") {
    return "Superadmin";
  }

  return message.senderName || message.senderEmail || "Support user";
}

export function SuperadminSupportCenterClient() {
  const router = useRouter();
  const [conversations, setConversations] = useState<SupportConversationListItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | "Dismissed" | "Pending" | "Solved">("All");

  useEffect(() => {
    let active = true;

    const loadConversations = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getSupportConversations({
          search: query.trim() || undefined,
          status: statusForApi(status) || undefined,
        });

        if (active) {
          setConversations(response.data?.conversations ?? []);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(getApiErrorMessage(error, "Unable to load support conversations."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const timeoutId = window.setTimeout(loadConversations, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [query, status]);

  const openConversationDetails = (conversationId: string) => {
    router.push(`/superadmin/dashboard/support-center/${conversationId}`);
  };

  return (
    <div className="space-y-6">
      <SuperadminPageHeader title="Support Center" subtitle="Manage customer support here" />

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
          <SupportStatusSelect value={status} onChange={setStatus} />
        </div>

        {errorMessage ? (
          <div className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
            {errorMessage}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[14px] border border-[#E6E9F0] bg-white">
          <div className="grid grid-cols-[1.2fr_1.4fr_0.7fr_0.7fr] gap-4 border-b border-[#EEF1F6] px-6 py-4 text-[11px] text-[#8A91AB]">
            <p>Buyer & Email</p>
            <p>Topic</p>
            <p>Status</p>
            <p>Date</p>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-center text-[13px] text-[#8A91AB]">Loading support conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="px-6 py-8 text-center text-[13px] text-[#8A91AB]">No support conversations found.</div>
          ) : (
            conversations.map((conversation) => {
              const participant = conversation.participant ?? {};
              const initials = getInitials(participant.name, participant.email);

              return (
                <div
                  key={conversation._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openConversationDetails(conversation._id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openConversationDetails(conversation._id);
                    }
                  }}
                  className="grid cursor-pointer grid-cols-[1.2fr_1.4fr_0.7fr_0.7fr] gap-4 border-b border-[#F3F5F9] px-6 py-3 transition hover:bg-[#F8FAFC] focus:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#314B6B]/20 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <SuperadminAvatar from="#8E9BFF" to="#F59E0B" initials={initials} size={28} />
                    <div>
                      <p className="text-[13px] font-medium text-[#202350]">{participant.name || "Support user"}</p>
                      <p className="text-[11px] text-[#8A91AB]">{participant.email || "No email"}</p>
                    </div>
                  </div>
                  <p className="text-[13px] font-medium text-[#202350]">
                    {conversation.subject || "Support request"}
                  </p>
                  <div>
                    <SuperadminStatusBadge status={normalizeSupportStatus(conversation.status)} />
                  </div>
                  <p className="text-[13px] text-[#34395B]">{formatDate(conversation.lastMessageAt || conversation.createdAt)}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export function SuperadminSupportDetailClient({
  conversationId,
}: {
  conversationId: string;
}) {
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  const participant = useMemo(
    () => conversation ? getConversationParticipant(conversation) : { email: "", name: "Support user", role: "" },
    [conversation],
  );

  useEffect(() => {
    let active = true;

    const loadConversation = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getSupportConversation(conversationId);

        if (active) {
          setConversation(response.data ?? null);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(getApiErrorMessage(error, "Unable to load support conversation."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadConversation();

    return () => {
      active = false;
    };
  }, [conversationId]);

  const handleReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!conversation?._id || !draft.trim() || saving) {
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const response = await sendSupportMessage(conversation._id, draft.trim());
      setConversation(response.data.conversation ?? conversation);
      setDraft("");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to send support reply."));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: "pending" | "dismissed" | "resolved") => {
    if (!conversation?._id || statusSaving) {
      return;
    }

    setStatusSaving(true);
    setErrorMessage("");

    try {
      const response = await updateSupportConversationStatus(conversation._id, status);
      setConversation(response.data ?? conversation);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to update support status."));
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-104px)] flex-col gap-8 overflow-hidden">
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <SuperadminBackLink href="/superadmin/dashboard/support-center" />
          <div>
            <h1 className="text-[20px] font-semibold tracking-[-0.04em] text-[#202350]">View Support message</h1>
            <p className="mt-1 text-[13px] text-[#69729A]">This section will help you to view message of that client</p>
          </div>
        </div>
        <SuperadminNotificationButton />
      </div>

      {loading ? (
        <div className="rounded-[14px] border border-[#E6E9F0] bg-white px-6 py-10 text-center text-sm text-[#69729A]">
          Loading support conversation...
        </div>
      ) : errorMessage && !conversation ? (
        <div className="rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-4 text-sm text-[#B42318]">
          {errorMessage}
        </div>
      ) : conversation ? (
        <section className="flex min-h-0 flex-1 flex-col gap-6">
          <div className="shrink-0 rounded-[14px] border border-[#E6E9F0] bg-white px-5 py-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <SuperadminAvatar from="#8E9BFF" to="#F59E0B" initials={getInitials(participant.name, participant.email)} size={48} />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Client</p>
                  <h2 className="mt-1 text-[18px] font-semibold text-[#202350]">{participant.name}</h2>
                  <p className="mt-1 text-[13px] text-[#69729A]">{participant.email || "No email"}</p>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Topic</p>
                  <p className="mt-1 text-[15px] font-medium text-[#202350]">{conversation.subject || "Support request"}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <SuperadminStatusBadge status={normalizeSupportStatus(conversation.status)} />
                {(["pending", "resolved", "dismissed"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      void handleStatusChange(status);
                    }}
                    disabled={statusSaving}
                    className="inline-flex h-8 items-center justify-center rounded-[6px] border border-[#DDE4EF] px-3 text-[12px] font-semibold capitalize text-[#526079] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "resolved" ? "Solved" : status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {errorMessage ? (
            <div className="shrink-0 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-[#E6E9F0] bg-white">
            <div className="shrink-0 border-b border-[#EEF1F6] px-5 py-4">
              <p className="text-[14px] font-semibold text-[#202350]">Conversation</p>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {(conversation.messages ?? []).length === 0 ? (
                <p className="text-sm text-[#69729A]">No messages yet.</p>
              ) : (
                (conversation.messages ?? []).map((message) => {
                  const outgoing = message.senderType === "superadmin";

                  return (
                    <div key={message._id} className={`flex ${outgoing ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[720px] rounded-[12px] px-4 py-3 ${outgoing ? "bg-[#314B6B] text-white" : "bg-[#F5F7FB] text-[#202350]"}`}>
                        <p className={`text-[12px] font-semibold ${outgoing ? "text-white/80" : "text-[#69729A]"}`}>
                          {messageSenderLabel(message)}
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-[14px] leading-6">{message.message}</p>
                        <p className={`mt-2 text-[11px] ${outgoing ? "text-white/70" : "text-[#8A91AB]"}`}>
                          {formatTime(message.sentAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleReply} className="shrink-0 border-t border-[#EEF1F6] px-5 py-4">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, 1000))}
                rows={4}
                maxLength={1000}
                placeholder="Write a reply..."
                className="w-full resize-none rounded-[10px] border border-[#DDE4EF] px-4 py-3 text-sm text-[#202350] outline-none placeholder:text-[#9AA1B6] focus:border-[#314B6B]"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={saving || !draft.trim()}
                  className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#314B6B] px-5 text-sm font-semibold text-white transition hover:bg-[#243B5A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </form>
          </div>
        </section>
      ) : (
        <div className="rounded-[14px] border border-[#E6E9F0] bg-white px-6 py-10 text-center text-sm text-[#69729A]">
          Support conversation not found.
        </div>
      )}
    </div>
  );
}
