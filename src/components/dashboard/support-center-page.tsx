"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import {
  deleteSupportAttachment,
  getMySupportConversation,
  getMySupportConversations,
  sendSupportMessage,
  uploadSupportAttachment,
  type ChatAttachment,
  type SupportConversation,
  type SupportMessage,
} from "@/lib/support-api";
import { DashboardIcon } from "./icons";
import { DashboardPageHeader } from "./page-header";

function getDashboardBase(pathname: string) {
  return pathname.startsWith("/investee-dashboard") ? "/investee-dashboard" : "/dashboard";
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

function normalizeStatus(status?: string) {
  switch ((status || "").toLowerCase()) {
    case "resolved":
      return "Solved";
    case "dismissed":
      return "Dismissed";
    default:
      return "Pending";
  }
}

function getStatusClassName(status?: string) {
  switch ((status || "").toLowerCase()) {
    case "resolved":
      return "bg-[#ECFDF3] text-[#027A48]";
    case "dismissed":
      return "bg-[#F2F4F7] text-[#667085]";
    default:
      return "bg-[#FFF4ED] text-[#E65E02]";
  }
}

function getLastMessage(conversation: SupportConversation) {
  return conversation.messages?.[conversation.messages.length - 1] ?? null;
}

function getMessagePreview(message?: SupportMessage | null) {
  if (!message) {
    return "No messages yet.";
  }

  return message.message || message.attachments?.[0]?.originalName || "Attachment";
}

function getSenderLabel(message: SupportMessage) {
  return message.senderType === "superadmin"
    ? "Superadmin"
    : message.senderName || message.senderEmail || "You";
}

function formatFileSize(size?: number) {
  if (!size) {
    return "";
  }

  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentList({
  attachments = [],
  canRemove = false,
  onRemove,
  tone = "light",
}: {
  attachments?: ChatAttachment[];
  canRemove?: boolean;
  onRemove?: (attachment: ChatAttachment) => void;
  tone?: "dark" | "light";
}) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.key}
          className={`flex items-center justify-between gap-3 rounded-[8px] border px-3 py-2 text-xs ${
            tone === "dark" ? "border-white/20 bg-white/10 text-white" : "border-[#DDE4EF] bg-white text-[#314B6B]"
          }`}
        >
          <a href={attachment.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-semibold underline-offset-2 hover:underline">
            {attachment.originalName}
          </a>
          <span className={tone === "dark" ? "text-white/70" : "text-[#8A91AB]"}>{formatFileSize(attachment.size)}</span>
          {canRemove ? (
            <button
              type="button"
              onClick={() => onRemove?.(attachment)}
              className={`shrink-0 rounded-[6px] px-2 py-1 font-semibold ${
                tone === "dark" ? "bg-white/10 text-white hover:bg-white/20" : "bg-[#F2F4F7] text-[#526079] hover:bg-[#E6EBF3]"
              }`}
            >
              Remove
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function DashboardSupportCenterPage() {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const dashboardBase = getDashboardBase(pathname);

  useEffect(() => {
    let active = true;

    const loadConversations = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getMySupportConversations();

        if (active) {
          setConversations(response.data ?? []);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(getApiErrorMessage(error, "Unable to load support messages."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadConversations();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Support Center" subtitle="Messages you sent to the support team are listed here" />

      {errorMessage ? (
        <div className="rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
          {errorMessage}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[18px] border border-[#E6EBF3] bg-white">
        <div className="grid grid-cols-[1.4fr_0.7fr_0.8fr] gap-4 border-b border-[#EEF2F7] px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">
          <p>Subject</p>
          <p>Status</p>
          <p>Last message</p>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-[#667085]">Loading support messages...</div>
        ) : conversations.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <h2 className="text-lg font-semibold text-[#1E2746]">No support messages yet</h2>
            <p className="mt-2 text-sm text-[#667085]">Messages sent from the contact page while signed in will appear here.</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const lastMessage = getLastMessage(conversation);

            return (
              <Link
                key={conversation._id}
                href={`${dashboardBase}/support-center/${conversation._id}`}
                className="grid grid-cols-[1.4fr_0.7fr_0.8fr] gap-4 border-b border-[#F3F5F9] px-5 py-4 transition last:border-b-0 hover:bg-[#F8FAFC]"
              >
                <div>
                  <p className="text-sm font-semibold text-[#1E2746]">{conversation.subject || "Support request"}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-[#667085]">{getMessagePreview(lastMessage)}</p>
                </div>
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(conversation.status)}`}>
                    {normalizeStatus(conversation.status)}
                  </span>
                </div>
                <p className="text-sm text-[#667085]">{formatTime(conversation.lastMessageAt || conversation.updatedAt || conversation.createdAt)}</p>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}

export function DashboardSupportDetailPage({ conversationId }: { conversationId: string }) {
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();
  const dashboardBase = getDashboardBase(pathname);

  const messages = useMemo(() => conversation?.messages ?? [], [conversation?.messages]);

  useEffect(() => {
    let active = true;

    const loadConversation = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getMySupportConversation(conversationId);

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

    if (!conversation?._id || (!draft.trim() && pendingAttachments.length === 0) || saving) {
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const response = await sendSupportMessage(conversation._id, draft.trim(), pendingAttachments);
      setConversation(response.data.conversation ?? conversation);
      setDraft("");
      setPendingAttachments([]);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to send support message."));
    } finally {
      setSaving(false);
    }
  };

  const handleAttachmentSelect = async (file?: File) => {
    if (!conversation?._id || !file || uploadingAttachment) {
      return;
    }

    setUploadingAttachment(true);
    setErrorMessage("");

    try {
      const response = await uploadSupportAttachment(conversation._id, file);
      setPendingAttachments((current) => [...current, response.data]);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to upload attachment."));
    } finally {
      setUploadingAttachment(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAttachment = async (attachment: ChatAttachment) => {
    if (!conversation?._id) {
      return;
    }

    setErrorMessage("");

    try {
      const response = await deleteSupportAttachment(conversation._id, attachment.key);
      setPendingAttachments((current) => current.filter((item) => item.key !== attachment.key));
      setConversation(response.data ?? conversation);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to remove attachment."));
    }
  };

  return (
    <section className="flex h-[calc(100vh-64px)] flex-col overflow-hidden rounded-[16px] bg-[#FCFCFD] text-[#243041]">
      <div className="shrink-0 px-4 pb-5 pt-3 sm:px-6">
        <Link href={`${dashboardBase}/support-center`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#314B6B]">
          <DashboardIcon name="chevronLeft" className="h-4 w-4" />
          Back to support center
        </Link>
        <div className="mt-5 flex flex-col gap-4 rounded-[16px] border border-[#E6EBF3] bg-white px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#1E2746]">
              {conversation?.subject || "Support message"}
            </h1>
            <p className="mt-2 text-sm text-[#667085]">
              Conversation with the support team.
            </p>
          </div>
          {conversation ? (
            <span className={`inline-flex self-start rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(conversation.status)}`}>
              {normalizeStatus(conversation.status)}
            </span>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-[#667085]">Loading support conversation...</div>
      ) : errorMessage && !conversation ? (
        <div className="mx-6 rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
          {errorMessage}
        </div>
      ) : conversation ? (
        <>
          {errorMessage ? (
            <div className="mx-6 shrink-0 rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
              {errorMessage}
            </div>
          ) : null}

          <div className="mx-4 min-h-0 flex-1 space-y-4 overflow-y-auto rounded-[16px] border border-[#E6EBF3] bg-white px-5 py-5 sm:mx-6">
            {messages.length === 0 ? (
              <p className="text-sm text-[#667085]">No messages yet.</p>
            ) : (
              messages.map((message) => {
                const outgoing = message.senderType !== "superadmin";

                return (
                  <div key={message._id} className={`flex ${outgoing ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[680px] rounded-[14px] px-4 py-3 ${outgoing ? "bg-[#314B6B] text-white" : "bg-[#F4F6FB] text-[#1E2746]"}`}>
                      <p className={`text-xs font-semibold ${outgoing ? "text-white/80" : "text-[#667085]"}`}>
                        {outgoing ? "You" : getSenderLabel(message)}
                      </p>
                      {message.message ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.message}</p> : null}
                      <AttachmentList
                        attachments={message.attachments}
                        canRemove={outgoing}
                        onRemove={(attachment) => {
                          void handleRemoveAttachment(attachment);
                        }}
                        tone={outgoing ? "dark" : "light"}
                      />
                      <p className={`mt-2 text-xs ${outgoing ? "text-white/70" : "text-[#98A2B3]"}`}>
                        {formatTime(message.sentAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleReply} className="shrink-0 px-4 pb-4 pt-4 sm:px-6">
            <div className="rounded-[16px] border border-[#D7DFEA] bg-white p-3">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, 1000))}
                maxLength={1000}
                rows={3}
                placeholder="Write a message..."
                className="w-full resize-none border-0 bg-transparent px-2 py-2 text-sm text-[#1E2746] outline-none placeholder:text-[#98A2B3]"
              />
              <div className="flex justify-end">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    void handleAttachmentSelect(event.target.files?.[0]);
                  }}
                />
                <AttachmentList
                  attachments={pendingAttachments}
                  canRemove
                  onRemove={(attachment) => {
                    void handleRemoveAttachment(attachment);
                  }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAttachment || saving}
                  className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#D7DFEA] px-3 text-sm font-semibold text-[#314B6B] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploadingAttachment ? "Uploading..." : "Attach file"}
                </button>
                <button
                  type="submit"
                  disabled={saving || (!draft.trim() && pendingAttachments.length === 0)}
                  className="inline-flex h-9 items-center justify-center rounded-[8px] bg-[#314B6B] px-4 text-sm font-semibold text-white transition hover:bg-[#243B5A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </form>
        </>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-[#667085]">Support conversation not found.</div>
      )}
    </section>
  );
}
