"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import { getStoredAccessToken, getStoredAuthState } from "@/lib/auth-storage";
import {
  createMeetingRequest,
  createOrGetInvestmentConversation,
  getConversationMessages,
  getConversationSidebar,
  getInvestmentConversation,
  markConversationSeen,
  type ConversationMessage,
  type ConversationMessagePagination,
  type ConversationStatus,
  type ConversationUserInfo,
  type InvestmentConversation,
  type SidebarConversation,
} from "@/lib/investment-conversations-api";
import { disconnectSocket, getSocket } from "@/lib/socket";
import { DashboardIcon } from "./icons";
import { DashboardPageHeader } from "./page-header";

type InboxFilter = "all" | ConversationStatus;

const INVESTMENT_SOCKET_EVENTS = {
  join: "investment:join",
  markSeen: "investment:mark-seen",
  meetingRequest: "investment:meeting-request",
  meetingRequestUpdated: "investment:meeting-request-updated",
  message: "investment:message",
  messagesSeen: "investment:messages-seen",
  sendMessage: "investment:send-message",
} as const;

type InvestmentSocketAck = {
  data?: {
    message?: ConversationMessage;
  };
  message?: string;
  success?: boolean;
};

type InvestmentMessagePayload = {
  conversationId?: string;
  message?: ConversationMessage;
};

type InvestmentMessagesSeenPayload = {
  conversationId?: string;
  seenMessageIds?: string[];
};

type InvestmentMeetingRequestPayload = {
  conversationId?: string;
};

type SocketParticipant = string | (ConversationUserInfo & { id?: string });

type SocketConversationMessage = ConversationMessage & {
  createdBy?: SocketParticipant;
  from?: SocketParticipant;
  receiver?: SocketParticipant;
  receiverId?: string;
  recipient?: SocketParticipant;
  recipientId?: string;
  sender?: SocketParticipant;
  senderId?: string;
  senderInfo?: SocketParticipant;
  user?: SocketParticipant;
  userId?: string;
};

type PendingOutgoingMessage = {
  sentAt: number;
  text: string;
};

type ScheduleForm = {
  date: string;
  endTime: string;
  location: string;
  locationDetails: string;
  note: string;
  startTime: string;
  timeZone: string;
  title: string;
};

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatMessageTime(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getConversationTitle(conversation?: InvestmentConversation | SidebarConversation | null) {
  if (!conversation) {
    return "Investment conversation";
  }

  const listTitle = "conversationId" in conversation ? conversation.listInfo?.title : conversation.list?.title;

  return (
    listTitle ??
    conversation.otherUserInfo?.name ??
    "Investment conversation"
  );
}

function getConversationListId(conversation?: InvestmentConversation | SidebarConversation | null) {
  if (!conversation) {
    return "";
  }

  return "conversationId" in conversation ? conversation.listInfo?._id ?? "" : conversation.list?._id ?? "";
}

function getMessagePreview(conversation: SidebarConversation) {
  return conversation.lastIncomingMessagePreview || conversation.lastIncomingMessage?.message || "No messages yet.";
}

function getParticipantId(value?: SocketParticipant | null) {
  return typeof value === "string" ? value : value?._id ?? value?.id;
}

function getSocketMessageSenderId(message: SocketConversationMessage) {
  return (
    message.senderId ??
    message.userId ??
    getParticipantId(message.sender) ??
    getParticipantId(message.senderInfo) ??
    getParticipantId(message.from) ??
    getParticipantId(message.createdBy) ??
    getParticipantId(message.user)
  );
}

function getSocketMessageReceiverId(message: SocketConversationMessage) {
  return (
    message.receiverId ??
    message.recipientId ??
    getParticipantId(message.receiver) ??
    getParticipantId(message.recipient)
  );
}

function normalizeSocketMessage(
  message: ConversationMessage,
  currentUserId: string,
  otherUserId: string,
  fallbackDirection: "incoming" | "outgoing",
) {
  const socketMessage = message as SocketConversationMessage;
  const senderId = getSocketMessageSenderId(socketMessage);
  const receiverId = getSocketMessageReceiverId(socketMessage);

  if (senderId && otherUserId && senderId === otherUserId) {
    return {
      ...message,
      direction: "incoming",
    };
  }

  if (receiverId && otherUserId && receiverId === otherUserId) {
    return {
      ...message,
      direction: "outgoing",
    };
  }

  if (senderId && currentUserId) {
    return {
      ...message,
      direction: senderId === currentUserId ? "outgoing" : "incoming",
    };
  }

  if (receiverId && currentUserId) {
    return {
      ...message,
      direction: receiverId === currentUserId ? "incoming" : "outgoing",
    };
  }

  return {
    ...message,
    direction: fallbackDirection,
  };
}

function normalizeBroadcastMessage(
  message: ConversationMessage,
  localMessageIds: Set<string>,
  pendingMessages: PendingOutgoingMessage[],
) {
  const now = Date.now();
  const messageText = message.message.trim();
  const recentlySentHere = pendingMessages.some((pendingMessage) => (
    pendingMessage.text === messageText && now - pendingMessage.sentAt < 15000
  ));

  return {
    ...message,
    direction: localMessageIds.has(message._id) || recentlySentHere ? "outgoing" : "incoming",
  };
}

function getMessageTimestamp(message: ConversationMessage) {
  const timestamp = new Date(message.sentAt ?? "").getTime();

  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

function mergeConversationMessages(
  current: ConversationMessage[],
  incoming: ConversationMessage[],
  options: { preserveCurrentDirection?: boolean } = {},
) {
  const currentOrder = new Map(current.map((message, index) => [message._id, index]));
  const messagesById = new Map(current.map((message) => [message._id, message]));

  for (const message of incoming) {
    const currentMessage = messagesById.get(message._id);
    const direction = options.preserveCurrentDirection
      ? currentMessage?.direction ?? message.direction
      : message.direction ?? currentMessage?.direction;

    messagesById.set(message._id, {
      ...currentMessage,
      ...message,
      direction,
    });
  }

  return Array.from(messagesById.values()).sort((first, second) => {
    const timestampDifference = getMessageTimestamp(first) - getMessageTimestamp(second);

    if (timestampDifference !== 0) {
      return timestampDifference;
    }

    return (currentOrder.get(first._id) ?? Number.MAX_SAFE_INTEGER) - (currentOrder.get(second._id) ?? Number.MAX_SAFE_INTEGER);
  });
}

function getStartOfTomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(10, 0, 0, 0);
  return date;
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildIsoFromLocal(date: string, time: string) {
  const nextDate = new Date(`${date}T${time}`);

  if (Number.isNaN(nextDate.getTime())) {
    return "";
  }

  return nextDate.toISOString();
}

function createDefaultScheduleForm(title: string): ScheduleForm {
  const startsAt = getStartOfTomorrow();
  const endsAt = new Date(startsAt);
  endsAt.setHours(startsAt.getHours() + 1);

  return {
    date: toDateInputValue(startsAt),
    endTime: endsAt.toTimeString().slice(0, 5),
    location: "Online meeting",
    locationDetails: "",
    note: "",
    startTime: startsAt.toTimeString().slice(0, 5),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    title: title ? `${title} Meeting` : "Investment Meeting",
  };
}

export function MessagesPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dashboardBase = pathname.startsWith("/investee-dashboard") ? "/investee-dashboard" : "/dashboard";
  const startListId = searchParams.get("listId") ?? "";

  const [conversations, setConversations] = useState<SidebarConversation[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<InvestmentConversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [pagination, setPagination] = useState<ConversationMessagePagination | null>(null);
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [draft, setDraft] = useState("");
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>(() => createDefaultScheduleForm(""));
  const [scheduleMessage, setScheduleMessage] = useState("");
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const selectedIdRef = useRef("");
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const currentUserIdRef = useRef("");
  const otherUserIdRef = useRef("");
  const localOutgoingMessageIdsRef = useRef<Set<string>>(new Set());
  const pendingOutgoingMessagesRef = useRef<PendingOutgoingMessage[]>([]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.conversationId === selectedId) ?? null,
    [conversations, selectedId],
  );
  const activeTitle = getConversationTitle(selectedConversation ?? activeConversation);
  const activeListId = getConversationListId(selectedConversation ?? activeConversation);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    const user = getStoredAuthState()?.state?.user as { _id?: string; id?: string } | null | undefined;
    currentUserIdRef.current = user?.id ?? user?._id ?? "";
  }, []);

  useEffect(() => {
    otherUserIdRef.current = selectedConversation?.otherUserInfo?._id ?? activeConversation?.otherUserInfo?._id ?? "";
  }, [activeConversation?.otherUserInfo?._id, selectedConversation?.otherUserInfo?._id]);

  const loadInbox = useCallback(async (nextSelectedId?: string, options: { silent?: boolean } = {}) => {
    if (!options.silent) {
      setLoadingInbox(true);
      setError("");
    }

    try {
      const response = await getConversationSidebar(filter === "all" ? undefined : filter);
      const items = Array.isArray(response.data) ? response.data : [];

      setConversations(items);

      const nextId = nextSelectedId || selectedIdRef.current || items[0]?.conversationId || "";
      setSelectedId(items.some((item) => item.conversationId === nextId) ? nextId : items[0]?.conversationId || "");
    } catch (loadError) {
      if (!options.silent) {
        setError(getApiErrorMessage(loadError, "Unable to load conversations."));
      }
    } finally {
      if (!options.silent) {
        setLoadingInbox(false);
      }
    }
  }, [filter]);

  const emitMarkSeen = useCallback((conversationId: string) => {
    const socket = socketRef.current;

    if (!socket) {
      void markConversationSeen(conversationId).catch(() => undefined);
      return;
    }

    socket.emit(INVESTMENT_SOCKET_EVENTS.markSeen, { conversationId }, (response: InvestmentSocketAck) => {
      if (!response?.success) {
        void markConversationSeen(conversationId).catch(() => undefined);
      }
    });
  }, []);

  const refreshConversationMessages = useCallback(async (conversationId: string) => {
    const [conversationResponse, messagesResponse] = await Promise.all([
      getInvestmentConversation(conversationId),
      getConversationMessages(conversationId, 1, 5),
    ]);

    if (selectedIdRef.current !== conversationId) {
      return;
    }

    setSelectedConversation(conversationResponse.data ?? null);
    setMessages((current) => mergeConversationMessages(
      current,
      messagesResponse.data?.messages ?? conversationResponse.data?.messages ?? [],
    ));
    setPagination((current) => messagesResponse.data?.pagination ?? current);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function startConversationFromQuery() {
      if (!startListId) {
        await loadInbox();
        return;
      }

      setLoadingInbox(true);
      setError("");

      try {
        const response = await createOrGetInvestmentConversation({
          initialMessage: "Hi, I am interested in this opportunity.",
          listId: startListId,
        });
        const conversationId = response.data?.conversation?._id;

        if (!cancelled) {
          await loadInbox(conversationId);
        }
      } catch (startError) {
        if (!cancelled) {
          setError(getApiErrorMessage(startError, "Unable to start this conversation."));
          await loadInbox();
        }
      } finally {
        if (!cancelled) {
          setLoadingInbox(false);
        }
      }
    }

    void startConversationFromQuery();

    return () => {
      cancelled = true;
    };
  }, [loadInbox, startListId]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    let cancelled = false;

    async function loadConversation() {
      setLoadingConversation(true);
      setError("");

      try {
        const [conversationResponse, messagesResponse] = await Promise.all([
          getInvestmentConversation(selectedId),
          getConversationMessages(selectedId, 1, 5),
        ]);

        if (cancelled) {
          return;
        }

        setSelectedConversation(conversationResponse.data ?? null);
        setMessages(messagesResponse.data?.messages ?? conversationResponse.data?.messages ?? []);
        setPagination(messagesResponse.data?.pagination ?? null);
        emitMarkSeen(selectedId);
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, "Unable to load conversation messages."));
        }
      } finally {
        if (!cancelled) {
          setLoadingConversation(false);
        }
      }
    }

    void loadConversation();

    return () => {
      cancelled = true;
    };
  }, [emitMarkSeen, selectedId]);

  useEffect(() => {
    const accessToken = getStoredAccessToken();

    if (!accessToken) {
      return;
    }

    const socket = getSocket(accessToken);
    socketRef.current = socket;

    function joinSelectedConversation() {
      const conversationId = selectedIdRef.current;

      if (!conversationId) {
        return;
      }

      socket.emit(
        INVESTMENT_SOCKET_EVENTS.join,
        {
          conversationId,
          token: accessToken,
        },
        (response: InvestmentSocketAck) => {
          if (!response?.success) {
            setError(response?.message ?? "Unable to join live conversation.");
          }
        },
      );
    }

    function refreshInbox() {
      void loadInbox(selectedIdRef.current, { silent: true });
    }

    function handleConnect() {
      setSocketConnected(true);
      joinSelectedConversation();
      refreshInbox();
    }

    function handleDisconnect() {
      setSocketConnected(false);
    }

    function handleMessage(payload: InvestmentMessagePayload) {
      const conversationId = payload.conversationId ?? "";

      if (payload.message && conversationId === selectedIdRef.current) {
        const message = normalizeBroadcastMessage(
          payload.message,
          localOutgoingMessageIdsRef.current,
          pendingOutgoingMessagesRef.current,
        );

        setMessages((current) => mergeConversationMessages(current, [message], { preserveCurrentDirection: true }));
        emitMarkSeen(conversationId);
        void refreshConversationMessages(conversationId).catch(() => undefined);
      }

      refreshInbox();
    }

    function handleMessagesSeen(payload: InvestmentMessagesSeenPayload) {
      if (payload.conversationId !== selectedIdRef.current || !payload.seenMessageIds?.length) {
        return;
      }

      const seenMessageIds = new Set(payload.seenMessageIds);
      setMessages((current) => current.map((message) => (
        seenMessageIds.has(message._id) ? { ...message, isSeen: true } : message
      )));
    }

    function handleMeetingRequest(payload: InvestmentMeetingRequestPayload) {
      if (!payload.conversationId || payload.conversationId === selectedIdRef.current) {
        refreshInbox();
      }
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on(INVESTMENT_SOCKET_EVENTS.message, handleMessage);
    socket.on(INVESTMENT_SOCKET_EVENTS.messagesSeen, handleMessagesSeen);
    socket.on(INVESTMENT_SOCKET_EVENTS.meetingRequest, handleMeetingRequest);
    socket.on(INVESTMENT_SOCKET_EVENTS.meetingRequestUpdated, handleMeetingRequest);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off(INVESTMENT_SOCKET_EVENTS.message, handleMessage);
      socket.off(INVESTMENT_SOCKET_EVENTS.messagesSeen, handleMessagesSeen);
      socket.off(INVESTMENT_SOCKET_EVENTS.meetingRequest, handleMeetingRequest);
      socket.off(INVESTMENT_SOCKET_EVENTS.meetingRequestUpdated, handleMeetingRequest);
      disconnectSocket();
      socketRef.current = null;
    };
  }, [emitMarkSeen, loadInbox, refreshConversationMessages]);

  useEffect(() => {
    const accessToken = getStoredAccessToken();
    const socket = socketRef.current;

    if (!accessToken || !socket || !selectedId) {
      return;
    }

    socket.emit(
      INVESTMENT_SOCKET_EVENTS.join,
      {
        conversationId: selectedId,
        token: accessToken,
      },
      (response: InvestmentSocketAck) => {
        if (!response?.success) {
          setError(response?.message ?? "Unable to join live conversation.");
        }
      },
    );
    emitMarkSeen(selectedId);
  }, [emitMarkSeen, selectedId]);

  async function loadOlderMessages() {
    if (!selectedId || !pagination?.hasMore || !pagination.nextPage) {
      return;
    }

    try {
      const response = await getConversationMessages(selectedId, pagination.nextPage, pagination.limitPairs ?? 5);
      setMessages((current) => [...(response.data?.messages ?? []), ...current]);
      setPagination(response.data?.pagination ?? pagination);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load older messages."));
    }
  }

  function handleSend() {
    const message = draft.trim();
    const socket = socketRef.current;

    if (!selectedId || !message || sending || !socket) {
      if (!socket) {
        setError("Live chat is not connected yet. Please try again in a moment.");
      }
      return;
    }

    setSending(true);
    setError("");
    pendingOutgoingMessagesRef.current = [
      ...pendingOutgoingMessagesRef.current.filter((pendingMessage) => Date.now() - pendingMessage.sentAt < 15000),
      { sentAt: Date.now(), text: message },
    ];

    const timeoutId = window.setTimeout(() => {
      setSending(false);
      setError("Message send timed out. Please try again.");
    }, 10000);

    socket.emit(
      INVESTMENT_SOCKET_EVENTS.sendMessage,
      {
        conversationId: selectedId,
        message,
      },
      (response: InvestmentSocketAck) => {
        window.clearTimeout(timeoutId);

        if (!response?.success) {
          setError(response?.message ?? "Unable to send message.");
          setSending(false);
          return;
        }

        const sentMessage = response.data?.message
          ? normalizeSocketMessage(response.data.message, currentUserIdRef.current, otherUserIdRef.current, "outgoing")
          : undefined;

        if (sentMessage) {
          localOutgoingMessageIdsRef.current.add(sentMessage._id);
          pendingOutgoingMessagesRef.current = pendingOutgoingMessagesRef.current.filter((pendingMessage) => pendingMessage.text !== message);
          setMessages((current) => mergeConversationMessages(current, [sentMessage], { preserveCurrentDirection: true }));
        }

        setDraft("");
        setSending(false);
        void loadInbox(selectedId, { silent: true });
      }
    );
  }

  function openScheduleModal() {
    setScheduleForm(createDefaultScheduleForm(activeTitle));
    setScheduleMessage("");
    setScheduleOpen(true);
  }

  async function submitScheduleRequest() {
    if (!selectedId || scheduleSaving) {
      return;
    }

    const startsAt = buildIsoFromLocal(scheduleForm.date, scheduleForm.startTime);
    const endsAt = buildIsoFromLocal(scheduleForm.date, scheduleForm.endTime);

    if (!startsAt || !endsAt || new Date(endsAt) <= new Date(startsAt)) {
      setScheduleMessage("Please choose a valid start and end time.");
      return;
    }

    setScheduleSaving(true);
    setScheduleMessage("");

    try {
      await createMeetingRequest(selectedId, {
        endsAt,
        location: scheduleForm.location.trim(),
        locationDetails: scheduleForm.locationDetails.trim(),
        note: scheduleForm.note.trim(),
        startsAt,
        timeZone: scheduleForm.timeZone.trim() || "UTC",
        title: scheduleForm.title.trim() || "Investment Meeting",
      });
      setScheduleMessage("Meeting request sent.");
      setScheduleOpen(false);
    } catch (scheduleError) {
      setScheduleMessage(getApiErrorMessage(scheduleError, "Unable to create meeting request."));
    } finally {
      setScheduleSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Message" subtitle="See all messages in here" />

      {error ? (
        <div className="rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[28px] border border-[#E6EBF3] bg-white shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)]">
        <div className="grid h-[calc(100vh-9.5rem)] min-h-[720px] lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col border-b border-[#EEF2F7] bg-[#FBFCFE] lg:border-b-0 lg:border-r">
            <div className="border-b border-[#EEF2F7] px-4 py-4">
              <div className="grid grid-cols-3 rounded-2xl bg-[#F1F4F9] p-1 text-xs font-medium text-[#6B7280]">
                {[
                  { label: "All", value: "all" as const },
                  { label: "Open", value: "active" as const },
                  { label: "Request", value: "pending" as const },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setFilter(item.value);
                      setSelectedId("");
                    }}
                    className={cx(
                      "rounded-xl px-3 py-2 text-center transition",
                      filter === item.value && "bg-white text-[#1E2746] shadow-sm",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {loadingInbox ? (
                <div className="px-4 py-6 text-sm text-[#667085]">Loading conversations...</div>
              ) : conversations.length ? (
                conversations.map((conversation) => (
                  <button
                    key={conversation.conversationId}
                    type="button"
                    onClick={() => setSelectedId(conversation.conversationId)}
                    className={cx(
                      "flex w-full items-start gap-3 border-b border-[#EEF2F7] px-4 py-4 text-left transition",
                      selectedId === conversation.conversationId ? "bg-white" : "hover:bg-white/70",
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="line-clamp-1 text-sm font-semibold text-[#1E2746]">
                          {getConversationTitle(conversation)}
                        </p>
                        <div className="flex items-center gap-2">
                          {conversation.unseenMessageCount ? (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4F46E5] px-1.5 text-[10px] font-semibold text-white">
                              {conversation.unseenMessageCount}
                            </span>
                          ) : null}
                          <span className="text-[11px] text-[#8A94A6]">
                            {conversation.timeAgo || formatMessageTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#7B8496]">
                        {getMessagePreview(conversation)}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-[#667085]">No conversations found.</div>
              )}
            </div>
          </aside>

          <div className="flex min-h-0 min-w-0 flex-col">
            {selectedId ? (
              <>
                <div className="border-b border-[#EEF2F7] px-4 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-[#1E2746]">{activeTitle}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#7B8496]">
                        <span>{selectedConversation?.otherUserInfo?.name ?? activeConversation?.otherUserInfo?.name}</span>
                        <span>{selectedConversation?.conversationStatus ?? activeConversation?.conversationStatus ?? "active"}</span>
                        {activeListId ? (
                          <Link
                            href={`/pitch/${activeListId}`}
                            className="inline-flex items-center rounded-xl bg-[#F2F5FA] px-3 py-1.5 font-medium text-[#314B6B] transition hover:bg-[#E7EDF6]"
                          >
                            Preview Pitch
                          </Link>
                        ) : null}
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-2xl border border-[#E7ECF3] bg-[#F8FAFC] px-3 py-2 text-xs text-[#6B7280]">
                      <DashboardIcon name="spark" className="h-4 w-4 text-[#ED6A06]" />
                      {socketConnected ? "Live conversation" : "Connecting live chat"}
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  {loadingConversation ? (
                    <div className="flex h-full min-h-[420px] items-center justify-center text-sm text-[#667085]">
                      Loading messages...
                    </div>
                  ) : messages.length ? (
                    <div className="space-y-4">
                      {pagination?.hasMore ? (
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              void loadOlderMessages();
                            }}
                            className="rounded-xl border border-[#DEE6F1] px-4 py-2 text-xs font-semibold text-[#314B6B] transition hover:bg-[#F4F7FB]"
                          >
                            Load older messages
                          </button>
                        </div>
                      ) : null}

                      {messages.map((message) => {
                        const outgoing = message.direction === "outgoing";

                        return (
                          <div
                            key={message._id}
                            className={cx(
                              "max-w-[440px] rounded-[24px] border px-4 py-4 shadow-sm",
                              outgoing ? "ml-auto border-[#DCE7F3] bg-white" : "border-[#E6EBF3] bg-[#F8F5EE]",
                            )}
                          >
                            <p className="text-sm font-semibold text-[#1E2746]">
                              {outgoing ? "You" : selectedConversation?.otherUserInfo?.name ?? "Sender"}
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#475467]">
                              {message.message}
                            </p>
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <span className="text-[11px] text-[#98A2B3]">{formatMessageTime(message.sentAt)}</span>
                              {outgoing ? <span className="text-[#98A2B3]">{message.isSeen ? "Seen" : "Sent"}</span> : null}
                            </div>
                          </div>
                        );
                      })}
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
                      onFocus={() => {
                        if (selectedId) {
                          emitMarkSeen(selectedId);
                        }
                      }}
                      placeholder="Type here..."
                      className="h-28 w-full resize-none rounded-2xl border-0 bg-transparent px-3 py-2 text-sm text-[#1E2746] outline-none placeholder:text-[#98A2B3]"
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={openScheduleModal}
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
                            void handleSend();
                          }}
                          disabled={sending || !draft.trim()}
                          className="inline-flex h-10 items-center justify-center rounded-xl bg-[#314B6B] px-4 text-sm font-semibold text-white transition hover:bg-[#243B5A] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {sending ? "Sending..." : "Send"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[520px] flex-col items-center justify-center p-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F4F6FB] text-[#314B6B]">
                  <DashboardIcon name="messages" className="h-10 w-10" />
                </div>
                <p className="mt-5 max-w-sm text-base text-[#475467]">
                  Select a conversation or query a pitch to start discussing an investment opportunity.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {scheduleOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/35 p-4"
          onClick={() => setScheduleOpen(false)}
        >
          <div
            className="w-full max-w-[440px] rounded-[24px] bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#1E2746]">Request Meeting</h2>
              <button
                type="button"
                onClick={() => setScheduleOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6B7280] transition hover:bg-[#F3F5F8]"
                aria-label="Close schedule modal"
              >
                x
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <input
                value={scheduleForm.title}
                onChange={(event) => setScheduleForm((current) => ({ ...current, title: event.target.value }))}
                className="h-11 w-full rounded-xl border border-[#D7DFEA] px-3 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                placeholder="Meeting title"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(event) => setScheduleForm((current) => ({ ...current, date: event.target.value }))}
                  className="h-11 rounded-xl border border-[#D7DFEA] px-3 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                />
                <input
                  value={scheduleForm.timeZone}
                  onChange={(event) => setScheduleForm((current) => ({ ...current, timeZone: event.target.value }))}
                  className="h-11 rounded-xl border border-[#D7DFEA] px-3 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                  placeholder="Time zone"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(event) => setScheduleForm((current) => ({ ...current, startTime: event.target.value }))}
                  className="h-11 rounded-xl border border-[#D7DFEA] px-3 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                />
                <input
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(event) => setScheduleForm((current) => ({ ...current, endTime: event.target.value }))}
                  className="h-11 rounded-xl border border-[#D7DFEA] px-3 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                />
              </div>

              <input
                value={scheduleForm.location}
                onChange={(event) => setScheduleForm((current) => ({ ...current, location: event.target.value }))}
                className="h-11 w-full rounded-xl border border-[#D7DFEA] px-3 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                placeholder="Location"
              />

              <input
                value={scheduleForm.locationDetails}
                onChange={(event) => setScheduleForm((current) => ({ ...current, locationDetails: event.target.value }))}
                className="h-11 w-full rounded-xl border border-[#D7DFEA] px-3 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                placeholder="Location details"
              />

              <textarea
                value={scheduleForm.note}
                onChange={(event) => setScheduleForm((current) => ({ ...current, note: event.target.value }))}
                className="h-24 w-full resize-none rounded-xl border border-[#D7DFEA] px-3 py-2 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                placeholder="Note"
              />
            </div>

            {scheduleMessage ? <p className="mt-3 text-sm text-[#B42318]">{scheduleMessage}</p> : null}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setScheduleOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#F3F4F6] px-5 text-sm font-medium text-[#6B7280] transition hover:bg-[#E5E7EB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void submitScheduleRequest();
                }}
                disabled={scheduleSaving}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#ED6A06] px-5 text-sm font-semibold text-white transition hover:bg-[#d35f05] disabled:cursor-wait disabled:opacity-60"
              >
                {scheduleSaving ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
