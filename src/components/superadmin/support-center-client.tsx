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

const PAGE_LIMIT = 8;

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
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    limit: PAGE_LIMIT,
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | "Dismissed" | "Pending" | "Solved">("All");

  useEffect(() => {
    let active = true;

    const loadConversations = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getSupportConversations({
          limit: PAGE_LIMIT,
          page,
          search: query.trim() || undefined,
          status: statusForApi(status) || undefined,
        });

        if (active) {
          setConversations(response.data?.conversations ?? []);
          setPagination({
            limit: response.data?.pagination?.limit ?? PAGE_LIMIT,
            page: response.data?.pagination?.page ?? page,
            total: response.data?.pagination?.total ?? response.data?.conversations?.length ?? 0,
            totalPages: response.data?.pagination?.totalPages ?? 1,
          });
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
  }, [page, query, status]);

  const openConversationDetails = (conversationId: string) => {
    router.push(`/superadmin/dashboard/support-center/${conversationId}`);
  };

  const pageStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const pageEnd = Math.min(pagination.page * pagination.limit, pagination.total);

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
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
              placeholder="Search user by name or company name"
              className="w-full border-0 bg-transparent text-[12px] text-[#20243A] outline-none placeholder:text-[#9AA1B6]"
            />
          </label>
          <SupportStatusSelect
            value={status}
            onChange={(nextStatus) => {
              setPage(1);
              setStatus(nextStatus);
            }}
          />
        </div>

        {errorMessage ? (
          <div className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
            {errorMessage}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[14px] border border-[#E6E9F0] bg-white">
          <div className="overflow-x-auto">
            <div className="grid min-w-[760px] grid-cols-[1.2fr_1.4fr_0.7fr_0.7fr] gap-4 border-b border-[#EEF1F6] px-6 py-4 text-[11px] text-[#8A91AB]">
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
                    className="grid cursor-pointer grid-cols-[1.2fr_1.4fr_0.7fr_0.7fr] gap-4 border-b border-[#F3F5F9] px-6 py-3 transition hover:bg-[#F8FAFC] focus:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#314B6B]/20 last:border-b-0 min-w-[760px]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <SuperadminAvatar from="#8E9BFF" to="#F59E0B" initials={initials} size={28} />
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#202350] truncate">{participant.name || "Support user"}</p>
                        <p className="text-[11px] text-[#8A91AB] truncate">{participant.email || "No email"}</p>
                      </div>
                    </div>
                    <p className="text-[13px] font-medium text-[#202350] truncate min-w-0">
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

          {!loading && conversations.length > 0 ? (
            <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-3 text-[10px] text-[#727A96]">
              <p>
                Showing {pageStart}-{pageEnd} of {pagination.total} support requests
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className={`inline-flex h-7 min-w-7 items-center justify-center rounded-[8px] border border-[#E4E8F0] px-2 ${
                    pagination.page <= 1 || loading ? "text-[#C2C8D6]" : "text-[#4A5271] hover:bg-[#F7F8FC]"
                  }`}
                >
                  Prev
                </button>
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-[8px] border border-[#CFD5E3] bg-white px-2 text-[#4A5271]">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages || loading}
                  onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                  className={`inline-flex h-7 min-w-7 items-center justify-center rounded-[8px] border border-[#E4E8F0] px-2 ${
                    pagination.page >= pagination.totalPages || loading ? "text-[#C2C8D6]" : "text-[#4A5271] hover:bg-[#F7F8FC]"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
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
    <div className="flex h-[calc(100vh-104px)] lg:h-[calc(100vh-48px)] flex-col gap-4 overflow-hidden">
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
        <section className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="shrink-0 rounded-[14px] border border-[#E6E9F0] bg-white px-5 py-3">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="shrink-0">
                  <SuperadminAvatar from="#8E9BFF" to="#F59E0B" initials={getInitials(participant.name, participant.email)} size={40} />
                </div>
                <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Client</p>
                    <h2 className="text-[15px] font-semibold text-[#202350] break-all">
                      {participant.name} <span className="text-[12px] font-normal text-[#69729A] ml-2">({participant.email || "No email"})</span>
                    </h2>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Topic</p>
                    <p className="text-[14px] font-medium text-[#202350] break-words">{conversation.subject || "Support request"}</p>
                  </div>
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
            <div className="shrink-0 border-b border-[#EEF1F6] px-5 py-4 bg-white">
              <p className="text-[14px] font-semibold text-[#202350]">Conversation</p>
            </div>
            <div className="min-h-0 flex-1 px-5 py-2 bg-white flex flex-col">
              <div className="min-h-0 flex-1 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] overflow-y-auto p-4 space-y-6">
                {(conversation.messages ?? []).length === 0 ? (
                  <p className="text-sm text-[#69729A] text-center py-8">No messages yet.</p>
                ) : (
                  (conversation.messages ?? []).map((message) => {
                    const outgoing = message.senderType === "superadmin";
                    const senderName = messageSenderLabel(message);
                    const messageText = message.message || conversation.subject || "Support ticket created";
                    const avatarInitials = getInitials(message.senderName || senderName, message.senderEmail);

                    return (
                      <div key={message._id} className={`flex items-start gap-3 ${outgoing ? "justify-end" : "justify-start"}`}>
                        {!outgoing && (
                          <div className="shrink-0">
                            <SuperadminAvatar from="#8E9BFF" to="#F59E0B" initials={avatarInitials} size={32} />
                          </div>
                        )}
                        
                        <div className={`min-w-0 max-w-[70%] flex flex-col ${outgoing ? "items-end" : "items-start"}`}>
                          <div className="flex items-center gap-2 px-1 mb-1 max-w-full">
                            <span className="text-[11px] font-semibold text-[#4A5271] break-all">
                              {senderName}
                            </span>
                          </div>
                          
                          <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                            outgoing 
                              ? "bg-[#4E4A86] text-white rounded-tr-none" 
                              : "bg-white text-[#202350] border border-[#E4E8F0] rounded-tl-none"
                          }`}>
                            <p className="whitespace-pre-wrap text-[13px] leading-6 break-words">{messageText}</p>
                            <p className={`mt-1.5 text-right text-[10px] ${outgoing ? "text-[#E0DDF0]" : "text-[#8A91AB]"}`}>
                              {formatTime(message.sentAt)}
                            </p>
                          </div>
                        </div>

                        {outgoing && (
                          <div className="shrink-0">
                            <SuperadminAvatar from="#4E4A86" to="#7C78B8" initials="SA" size={32} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <form onSubmit={handleReply} className="shrink-0 px-5 pb-4 pt-2 bg-white">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, 1000))}
                rows={3}
                maxLength={1000}
                placeholder="Write a reply..."
                className="w-full resize-none rounded-[10px] border border-[#DDE4EF] px-4 py-3 text-sm text-[#202350] outline-none placeholder:text-[#9AA1B6] focus:border-[#4E4A86] focus:ring-1 focus:ring-[#4E4A86]"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={saving || !draft.trim()}
                  className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#4E4A86] px-5 text-sm font-semibold text-white transition hover:bg-[#3F3B73] disabled:cursor-not-allowed disabled:opacity-60"
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
