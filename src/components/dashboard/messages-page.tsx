"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import { getStoredAccessToken, getStoredAuthState } from "@/lib/auth-storage";
import {
  createOrGetInvestmentConversation,
  getConversationMessages,
  getConversationSidebar,
  getInvestmentConversation,
  markConversationSeen,
  sendConversationMessage,
  type ConversationMessage,
  type ConversationMessagePagination,
  type ConversationSeenByEntry,
  type ConversationStatus,
  type ConversationUserInfo,
  type InvestmentConversation,
  type SidebarConversation,
} from "@/lib/investment-conversations-api";
import { getList, type ListItemResponse } from "@/lib/list-api";
import { createSchedule, getSchedule, getSchedules, type Schedule } from "@/lib/schedule-api";
import { disconnectSocket, getSocket } from "@/lib/socket";
import { DashboardIcon } from "./icons";

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
    message?: ConversationMessage | null;
  };
  message?: string;
  success?: boolean;
};

type InvestmentMessagePayload = {
  conversationId?: string;
  message?: ConversationMessage | null;
};

type InvestmentMessagesSeenPayload = {
  conversationId?: string;
  messageId?: string;
  messageIds?: string[];
  messages?: ConversationMessage[];
  readBy?: SocketParticipant;
  readByUserId?: string;
  seenBy?: SocketParticipant;
  seenByUserId?: string;
  seenMessages?: ConversationMessage[];
  seenMessageIds?: string[];
  userId?: string;
};

type InvestmentMeetingRequestPayload = {
  conversationId?: string;
};

type SocketParticipant = string | ConversationUserInfo | ConversationSeenByEntry;

type SocketConversationMessage = ConversationMessage & {
  author?: SocketParticipant;
  authorId?: string;
  authorRole?: string;
  createdBy?: SocketParticipant;
  createdById?: string;
  createdByRole?: string;
  from?: SocketParticipant;
  fromId?: string;
  fromRole?: string;
  receiver?: SocketParticipant;
  receiverId?: string;
  recipient?: SocketParticipant;
  recipientId?: string;
  role?: string;
  sender?: SocketParticipant;
  senderId?: string;
  senderInfo?: SocketParticipant;
  senderRole?: string;
  senderType?: string;
  sentBy?: SocketParticipant;
  sentById?: string;
  sentByRole?: string;
  user?: SocketParticipant;
  userId?: string;
  userRole?: string;
};

type PendingOutgoingMessage = {
  sentAt: number;
  text: string;
};

type ChatTimelineItem =
  | {
      id: string;
      item: ConversationMessage;
      kind: "message";
      order: number;
      timestamp: number;
    }
  | {
      id: string;
      item: Schedule;
      kind: "schedule";
      order: number;
      timestamp: number;
    };

const READ_RECEIPTS_STORAGE_KEY = "earlyn.dashboard.messageReadReceipts.v2";

function MessageStatus({ seen }: { seen?: boolean }) {
  return (
    <span
      className="inline-flex items-center normal-case tracking-normal"
      aria-label={seen ? "Seen" : "Sent"}
      title={seen ? "Seen" : "Sent"}
    >
      <span className="relative inline-flex h-3.5 w-4 text-[#777777]" aria-hidden="true">
        <svg className="absolute left-0 top-0 h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
          <path d="m3 8.2 2.6 2.6L13 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {seen ? (
          <svg className="absolute left-[5px] top-0 h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
            <path d="m3 8.2 2.6 2.6L13 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
    </span>
  );
}

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

function isSeenWriteConflictMessage(message?: string) {
  return Boolean(
    message?.includes("No matching document found for id") &&
    message.includes("modifiedPaths") &&
    message.includes("seenBy"),
  );
}

function isSeenWriteConflictError(error: unknown) {
  return isSeenWriteConflictMessage(getApiErrorMessage(error, ""));
}

function isNonBlockingSocketMessage(message?: string) {
  const normalizedMessage = message?.toLowerCase() ?? "";

  return isSeenWriteConflictMessage(message) || normalizedMessage.includes("socket join failed");
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

function formatFundingTarget(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "";
  }

  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 1 })}`;
}

function normalizeParticipantRole(role?: string | null) {
  const normalizedRole = role?.trim().toLowerCase().replace(/[\s_-]+/g, "") ?? "";

  switch (normalizedRole) {
    case "investee":
      return "investee";
    case "investor":
      return "investor";
    case "admin":
    case "superadmin":
      return "superadmin";
    default:
      return "";
  }
}

function getParticipantIdValue(value?: string) {
  if (!value || normalizeParticipantRole(value)) {
    return undefined;
  }

  return value;
}

function getParticipantId(value?: SocketParticipant | null): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return getParticipantIdValue(value);
  }

  if ("user" in value && value.user) {
    return getParticipantId(value.user);
  }

  if ("_id" in value && value._id) {
    return value._id;
  }

  if ("id" in value && value.id) {
    return value.id;
  }

  return undefined;
}

function getParticipantName(value?: SocketParticipant | null): string {
  if (!value || typeof value === "string") {
    return "";
  }

  if ("user" in value && value.user) {
    const nestedName = getParticipantName(value.user);

    if (nestedName) {
      return nestedName;
    }
  }

  const participant = value as ConversationUserInfo;
  const combinedName = [participant.firstName, participant.lastName].filter(Boolean).join(" ").trim();

  return (
    participant.name?.trim() ||
    participant.fullName?.trim() ||
    participant.fullLegalName?.trim() ||
    participant.displayName?.trim() ||
    combinedName ||
    participant.personalIdentity?.fullLegalName?.trim() ||
    participant.profile?.name?.trim() ||
    participant.profile?.fullName?.trim() ||
    participant.profile?.displayName?.trim() ||
    participant.companyName?.trim() ||
    participant.username?.trim() ||
    participant.email?.trim() ||
    ""
  );
}

function getParticipantRole(value?: SocketParticipant | null): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return normalizeParticipantRole(value);
  }

  if ("user" in value && value.user) {
    const nestedRole = getParticipantRole(value.user);

    if (nestedRole) {
      return nestedRole;
    }
  }

  return normalizeParticipantRole((value as ConversationUserInfo).role);
}

function formatParticipantRole(role?: string) {
  switch (normalizeParticipantRole(role)) {
    case "investee":
      return "Investee";
    case "investor":
      return "Investor";
    case "superadmin":
      return "Super admin";
    default:
      return "";
  }
}

function getConversationParticipants(conversation?: InvestmentConversation | SidebarConversation | null): SocketParticipant[] {
  if (!conversation) {
    return [];
  }

  return [
    conversation.otherUserInfo,
    conversation.investorInfo,
    conversation.investeeInfo,
    conversation.adminInfo,
    conversation.investor,
    conversation.investee,
    conversation.admin,
    ...(conversation.participants ?? []),
    ...(conversation.users ?? []),
  ].filter(Boolean) as SocketParticipant[];
}

function getConversationRoleParticipants(
  role: string | undefined,
  conversation?: InvestmentConversation | SidebarConversation | null,
): SocketParticipant[] {
  if (!conversation) {
    return [];
  }

  switch (normalizeParticipantRole(role)) {
    case "investee":
      return [conversation.investeeInfo, conversation.investee].filter(Boolean) as SocketParticipant[];
    case "investor":
      return [conversation.investorInfo, conversation.investor].filter(Boolean) as SocketParticipant[];
    case "superadmin":
      return [conversation.adminInfo, conversation.admin].filter(Boolean) as SocketParticipant[];
    default:
      return [];
  }
}

function findParticipantById(
  participantId: string | undefined,
  ...conversations: Array<InvestmentConversation | SidebarConversation | null>
) {
  if (!participantId) {
    return undefined;
  }

  return conversations
    .flatMap((conversation) => getConversationParticipants(conversation))
    .find((participant) => getParticipantId(participant) === participantId);
}

function findParticipantByRole(
  role: string | undefined,
  ...conversations: Array<InvestmentConversation | SidebarConversation | null>
) {
  const normalizedRole = normalizeParticipantRole(role);

  if (!normalizedRole) {
    return undefined;
  }

  const explicitParticipant = conversations
    .flatMap((conversation) => getConversationRoleParticipants(normalizedRole, conversation))
    .find((participant) => getParticipantName(participant) || getParticipantId(participant));

  if (explicitParticipant) {
    return explicitParticipant;
  }

  return conversations
    .flatMap((conversation) => getConversationParticipants(conversation))
    .find((participant) => getParticipantRole(participant) === normalizedRole);
}

function getReadReceiptKey(conversationId: string, messageId: string) {
  return `${conversationId}:${messageId}`;
}

function loadStoredReadReceipts() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(READ_RECEIPTS_STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function persistStoredReadReceipts(receipts: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(READ_RECEIPTS_STORAGE_KEY, JSON.stringify(Array.from(receipts).slice(-500)));
}

function hasExplicitRecipientSeen(message: ConversationMessage, otherUserId: string) {
  if (!otherUserId) {
    return false;
  }

  const seenByIds = new Set([
    ...(message.seenBy ?? []).map((participant) => getParticipantId(participant)),
    ...(message.readBy ?? []).map((participant) => getParticipantId(participant)),
    ...(message.seenByUsers ?? []).map((participant) => getParticipantId(participant)),
    ...(message.seenByIds ?? []),
  ].filter(Boolean));

  return seenByIds.has(otherUserId);
}

function getOutgoingSeenStatus(
  message: ConversationMessage,
  conversationId: string,
  otherUserId: string,
  readReceiptIds: Set<string>,
) {
  if (readReceiptIds.has(getReadReceiptKey(conversationId, message._id))) {
    return true;
  }

  if (hasExplicitRecipientSeen(message, otherUserId)) {
    return true;
  }

  return false;
}

function rememberExplicitReadReceipts(
  messages: ConversationMessage[],
  conversationId: string,
  otherUserId: string,
  readReceiptIds: Set<string>,
) {
  let changed = false;

  for (const message of messages) {
    if (message.direction === "outgoing" && hasExplicitRecipientSeen(message, otherUserId)) {
      readReceiptIds.add(getReadReceiptKey(conversationId, message._id));
      changed = true;
    }
  }

  if (changed) {
    persistStoredReadReceipts(readReceiptIds);
  }
}

function getSeenMessageIds(payload: InvestmentMessagesSeenPayload) {
  return new Set([
    ...(payload.seenMessageIds ?? []),
    ...(payload.messageIds ?? []),
    ...(payload.messageId ? [payload.messageId] : []),
    ...(payload.messages ?? []).map((message) => message._id),
    ...(payload.seenMessages ?? []).map((message) => message._id),
  ].filter(Boolean));
}

function normalizeOutgoingSeenStatus(
  messages: ConversationMessage[],
  conversationId: string,
  otherUserId: string,
  readReceiptIds: Set<string>,
) {
  rememberExplicitReadReceipts(messages, conversationId, otherUserId, readReceiptIds);

  return messages.map((message) => (
    message.direction === "outgoing"
      ? { ...message, isSeen: getOutgoingSeenStatus(message, conversationId, otherUserId, readReceiptIds) }
      : message
  ));
}

function getSocketMessageSenderId(message: SocketConversationMessage) {
  return (
    getParticipantIdValue(message.senderId) ??
    getParticipantIdValue(message.sentById) ??
    getParticipantIdValue(message.authorId) ??
    getParticipantIdValue(message.createdById) ??
    getParticipantIdValue(message.fromId) ??
    getParticipantIdValue(message.userId) ??
    getParticipantId(message.sender) ??
    getParticipantId(message.senderInfo) ??
    getParticipantId(message.sentBy) ??
    getParticipantId(message.author) ??
    getParticipantId(message.from) ??
    getParticipantId(message.createdBy) ??
    getParticipantId(message.user)
  );
}

function getSocketMessageReceiverId(message: SocketConversationMessage) {
  return (
    getParticipantIdValue(message.receiverId) ??
    getParticipantIdValue(message.recipientId) ??
    getParticipantId(message.receiver) ??
    getParticipantId(message.recipient)
  );
}

function getSocketMessageSenderRole(message: SocketConversationMessage, matchedParticipant?: SocketParticipant) {
  return [
    message.senderRole,
    message.senderType,
    message.sentByRole,
    message.authorRole,
    message.createdByRole,
    message.fromRole,
    message.userRole,
    message.role,
    message.senderId,
    message.sentById,
    message.authorId,
    message.createdById,
    message.fromId,
    message.userId,
    getParticipantRole(message.senderInfo),
    getParticipantRole(message.sender),
    getParticipantRole(message.sentBy),
    getParticipantRole(message.author),
    getParticipantRole(message.from),
    getParticipantRole(message.createdBy),
    getParticipantRole(message.user),
    getParticipantRole(matchedParticipant),
  ].map((role) => normalizeParticipantRole(role)).find(Boolean);
}

function getMessageSenderName(
  message: ConversationMessage,
  selectedConversation: InvestmentConversation | null,
  activeConversation: SidebarConversation | null,
  currentUserId: string,
  currentUserRole: string,
) {
  const socketMessage = message as SocketConversationMessage;
  const senderId = getSocketMessageSenderId(socketMessage);

  if (senderId && currentUserId && senderId === currentUserId) {
    return "You";
  }

  const directName = [
    getParticipantName(socketMessage.senderInfo),
    getParticipantName(socketMessage.sender),
    getParticipantName(socketMessage.sentBy),
    getParticipantName(socketMessage.author),
    getParticipantName(socketMessage.from),
    getParticipantName(socketMessage.createdBy),
    getParticipantName(socketMessage.user),
  ].find(Boolean);

  if (directName) {
    return directName;
  }

  const matchedParticipant = findParticipantById(senderId, selectedConversation, activeConversation);
  const matchedName = getParticipantName(matchedParticipant);

  if (matchedName) {
    return matchedName;
  }

  const directRole = getSocketMessageSenderRole(socketMessage, matchedParticipant);
  const matchedRoleParticipant = findParticipantByRole(directRole, selectedConversation, activeConversation);
  const matchedRoleName = getParticipantName(matchedRoleParticipant);

  if (matchedRoleName) {
    return matchedRoleName;
  }

  const roleLabel = formatParticipantRole(directRole);

  if (roleLabel) {
    return roleLabel;
  }

  if (currentUserRole !== "superadmin") {
    return selectedConversation?.otherUserInfo?.name ?? activeConversation?.otherUserInfo?.name ?? "Sender";
  }

  return "Participant";
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

function normalizeLoadedMessageDirections(messages: ConversationMessage[], currentUserId: string) {
  if (!currentUserId) {
    return messages;
  }

  return messages.map((message) => {
    const senderId = getSocketMessageSenderId(message as SocketConversationMessage);

    if (!senderId) {
      return message;
    }

    return {
      ...message,
      direction: senderId === currentUserId ? "outgoing" : "incoming",
    };
  });
}

function normalizeBroadcastMessage(
  message: ConversationMessage,
  currentUserId: string,
  localMessageIds: Set<string>,
  pendingMessages: PendingOutgoingMessage[],
) {
  const senderId = getSocketMessageSenderId(message as SocketConversationMessage);

  if (senderId && currentUserId) {
    const outgoing = senderId === currentUserId;

    return {
      ...message,
      direction: outgoing ? "outgoing" : "incoming",
      isSeen: outgoing ? false : message.isSeen,
    };
  }

  const now = Date.now();
  const messageText = message.message.trim();
  const recentlySentHere = pendingMessages.some((pendingMessage) => (
    pendingMessage.text === messageText && now - pendingMessage.sentAt < 15000
  ));

  return {
    ...message,
    direction: localMessageIds.has(message._id) || recentlySentHere ? "outgoing" : "incoming",
    isSeen: localMessageIds.has(message._id) || recentlySentHere ? false : message.isSeen,
  };
}

function getMessageTimestamp(message: ConversationMessage) {
  const timestamp = new Date(message.sentAt ?? "").getTime();

  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

function getScheduleStart(schedule: Schedule) {
  return schedule.startsAt ?? schedule.dateTime;
}

function getScheduleTimelineTimestamp(schedule: Schedule) {
  const timestamp = new Date(schedule.createdAt ?? schedule.updatedAt ?? getScheduleStart(schedule) ?? "").getTime();

  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

function getScheduleUserId(user?: Schedule["createdBy"] | null) {
  return user?._id ?? user?.id ?? "";
}

function isScheduleOutgoing(schedule: Schedule, currentUserId: string) {
  const creatorId = getScheduleUserId(schedule.createdBy);

  return Boolean(creatorId && currentUserId && creatorId === currentUserId);
}

function formatScheduleDate(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatScheduleDateTime(value?: string) {
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
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatScheduleTimeRange(schedule?: Schedule | null) {
  if (!schedule) {
    return "";
  }

  return [formatMessageTime(getScheduleStart(schedule)), formatMessageTime(schedule.endsAt)]
    .filter(Boolean)
    .join(" - ") || formatScheduleDateTime(getScheduleStart(schedule));
}

function formatScheduleParticipant(user?: Schedule["investor"] | null) {
  if (!user) {
    return "Not assigned";
  }

  return user.name?.trim() || user.email?.trim() || "Not assigned";
}

function mergeSchedules(current: Schedule[], incoming: Schedule[]) {
  const schedulesById = new Map(current.map((schedule) => [schedule._id, schedule]));

  for (const schedule of incoming) {
    schedulesById.set(schedule._id, {
      ...schedulesById.get(schedule._id),
      ...schedule,
    });
  }

  return Array.from(schedulesById.values()).sort((first, second) => (
    getScheduleTimelineTimestamp(first) - getScheduleTimelineTimestamp(second)
  ));
}

function buildTimelineItems(messages: ConversationMessage[], schedules: Schedule[]): ChatTimelineItem[] {
  return [
    ...messages.map((message, index): ChatTimelineItem => ({
      id: `message-${message._id}`,
      item: message,
      kind: "message",
      order: index,
      timestamp: getMessageTimestamp(message),
    })),
    ...schedules.map((schedule, index): ChatTimelineItem => ({
      id: `schedule-${schedule._id}`,
      item: schedule,
      kind: "schedule",
      order: messages.length + index,
      timestamp: getScheduleTimelineTimestamp(schedule),
    })),
  ].sort((first, second) => {
    const timestampDifference = first.timestamp - second.timestamp;

    if (timestampDifference !== 0) {
      return timestampDifference;
    }

    return first.order - second.order;
  });
}

function mergeConversationMessages(
  current: ConversationMessage[],
  incoming: ConversationMessage[],
  options: { preserveCurrentDirection?: boolean; preserveCurrentSeen?: boolean } = {},
) {
  const currentOrder = new Map(current.map((message, index) => [message._id, index]));
  const messagesById = new Map(current.map((message) => [message._id, message]));

  for (const message of incoming) {
    const currentMessage = messagesById.get(message._id);
    const direction = options.preserveCurrentDirection
      ? currentMessage?.direction ?? message.direction
      : message.direction ?? currentMessage?.direction;
    const isSeen = options.preserveCurrentSeen && currentMessage?.direction === "outgoing"
      ? Boolean(currentMessage.isSeen || message.isSeen)
      : message.isSeen ?? currentMessage?.isSeen;

    messagesById.set(message._id, {
      ...currentMessage,
      ...message,
      direction,
      isSeen,
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
  const dashboardBase = pathname.startsWith("/superadmin")
    ? "/superadmin/dashboard"
    : pathname.startsWith("/investee-dashboard")
      ? "/investee-dashboard"
      : "/dashboard";
  const startListId = searchParams.get("listId") ?? "";
  const startConversationId = searchParams.get("conversationId") ?? "";
  const targetMessageId = searchParams.get("messageId") ?? "";

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
  const [conversationSchedules, setConversationSchedules] = useState<Schedule[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>(() => createDefaultScheduleForm(""));
  const [scheduleMessage, setScheduleMessage] = useState("");
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleDetailOpen, setScheduleDetailOpen] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null);
  const [scheduleDetailError, setScheduleDetailError] = useState("");
  const [loadingScheduleDetail, setLoadingScheduleDetail] = useState(false);
  const [currentUser] = useState(() => {
    const user = getStoredAuthState()?.state?.user as { _id?: string; id?: string; role?: string } | null | undefined;

    return {
      id: user?.id ?? user?._id ?? "",
      role: user?.role ?? "",
    };
  });
  const [socketConnected, setSocketConnected] = useState(false);
  const [activeList, setActiveList] = useState<ListItemResponse | null>(null);
  const selectedIdRef = useRef("");
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const currentUserIdRef = useRef(currentUser.id);
  const otherUserIdRef = useRef("");
  const localOutgoingMessageIdsRef = useRef<Set<string>>(new Set());
  const pendingOutgoingMessagesRef = useRef<PendingOutgoingMessage[]>([]);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const readReceiptIdsRef = useRef<Set<string>>(new Set());
  const markSeenInFlightRef = useRef<Set<string>>(new Set());
  const lastMarkSeenAtRef = useRef<Record<string, number>>({});

  useEffect(() => {
    readReceiptIdsRef.current = loadStoredReadReceipts();
  }, []);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.conversationId === selectedId) ?? null,
    [conversations, selectedId],
  );
  const activeTitle = getConversationTitle(selectedConversation ?? activeConversation);
  const activeListId = getConversationListId(selectedConversation ?? activeConversation);
  const visibleActiveList = activeList?._id === activeListId ? activeList : null;
  const activeFundingTarget = formatFundingTarget(visibleActiveList?.fundingTarget);
  const viewerRole = normalizeParticipantRole(currentUser.role) || (pathname.startsWith("/superadmin") ? "superadmin" : "");
  const canCreateSchedules = viewerRole === "superadmin";
  const timelineItems = useMemo(
    () => buildTimelineItems(messages, conversationSchedules),
    [conversationSchedules, messages],
  );

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    otherUserIdRef.current = selectedConversation?.otherUserInfo?._id ?? activeConversation?.otherUserInfo?._id ?? "";
  }, [activeConversation?.otherUserInfo?._id, selectedConversation?.otherUserInfo?._id]);

  useEffect(() => {
    if (!activeListId) {
      return;
    }

    let cancelled = false;

    async function loadActiveList() {
      try {
        const response = await getList(activeListId);

        if (!cancelled) {
          setActiveList(response.data ?? null);
        }
      } catch {
        if (!cancelled) {
          setActiveList(null);
        }
      }
    }

    void loadActiveList();

    return () => {
      cancelled = true;
    };
  }, [activeListId]);

  const latestTimelineItemId = timelineItems.at(-1)?.id ?? "";

  useEffect(() => {
    if (!latestTimelineItemId) {
      return;
    }

    window.requestAnimationFrame(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    });
  }, [latestTimelineItemId]);

  useEffect(() => {
    if (!targetMessageId || loadingConversation) {
      return;
    }

    window.requestAnimationFrame(() => {
      document.getElementById(`message-${targetMessageId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [loadingConversation, messages, targetMessageId]);

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
    const now = Date.now();
    const lastMarkedAt = lastMarkSeenAtRef.current[conversationId] ?? 0;

    if (markSeenInFlightRef.current.has(conversationId) || now - lastMarkedAt < 1200) {
      return;
    }

    markSeenInFlightRef.current.add(conversationId);
    lastMarkSeenAtRef.current[conversationId] = now;
    const socket = socketRef.current;

    if (!socket) {
      void markConversationSeen(conversationId)
        .catch(() => undefined)
        .finally(() => {
          markSeenInFlightRef.current.delete(conversationId);
        });
      return;
    }

    socket.emit(INVESTMENT_SOCKET_EVENTS.markSeen, { conversationId }, (response: InvestmentSocketAck) => {
      if (response?.success || isSeenWriteConflictMessage(response?.message)) {
        markSeenInFlightRef.current.delete(conversationId);
        return;
      }

      void markConversationSeen(conversationId)
        .catch(() => undefined)
        .finally(() => {
          markSeenInFlightRef.current.delete(conversationId);
        });
    });
  }, []);

  const refreshConversationSchedules = useCallback(async (conversationId: string) => {
    if (!conversationId) {
      setConversationSchedules([]);
      return;
    }

    const response = await getSchedules({ conversationId });
    const items = Array.isArray(response.data) ? response.data : [];

    if (selectedIdRef.current === conversationId) {
      setConversationSchedules(items);
    }
  }, []);

  const refreshConversationMessages = useCallback(async (conversationId: string) => {
    const [conversationResponse, messagesResponse, schedulesResponse] = await Promise.all([
      getInvestmentConversation(conversationId),
      getConversationMessages(conversationId, 1, 5),
      getSchedules({ conversationId }).catch(() => ({ data: [] as Schedule[] })),
    ]);

    if (selectedIdRef.current !== conversationId) {
      return;
    }

    const nextOtherUserId = conversationResponse.data?.otherUserInfo?._id ?? otherUserIdRef.current;

    if (nextOtherUserId) {
      otherUserIdRef.current = nextOtherUserId;
    }

    setSelectedConversation(conversationResponse.data ?? null);
    setMessages((current) => mergeConversationMessages(
      current,
      normalizeOutgoingSeenStatus(
        normalizeLoadedMessageDirections(
          messagesResponse.data?.messages ?? conversationResponse.data?.messages ?? [],
          currentUserIdRef.current,
        ),
        conversationId,
        nextOtherUserId,
        readReceiptIdsRef.current,
      ),
      { preserveCurrentSeen: true },
    ));
    setPagination((current) => messagesResponse.data?.pagination ?? current);
    setConversationSchedules(Array.isArray(schedulesResponse.data) ? schedulesResponse.data : []);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function startConversationFromQuery() {
      if (startConversationId) {
        await loadInbox(startConversationId);
        return;
      }

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
  }, [loadInbox, startConversationId, startListId]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    let cancelled = false;

    async function loadConversation() {
      setLoadingConversation(true);
      setError("");

      try {
        const [conversationResponse, messagesResponse, schedulesResponse] = await Promise.all([
          getInvestmentConversation(selectedId),
          getConversationMessages(selectedId, 1, 5),
          getSchedules({ conversationId: selectedId }).catch(() => ({ data: [] as Schedule[] })),
        ]);

        if (cancelled) {
          return;
        }

        const nextOtherUserId = conversationResponse.data?.otherUserInfo?._id ?? otherUserIdRef.current;

        if (nextOtherUserId) {
          otherUserIdRef.current = nextOtherUserId;
        }

        setSelectedConversation(conversationResponse.data ?? null);
        setMessages(mergeConversationMessages(
          [],
          normalizeOutgoingSeenStatus(
            normalizeLoadedMessageDirections(
              messagesResponse.data?.messages ?? conversationResponse.data?.messages ?? [],
              currentUserIdRef.current,
            ),
            selectedId,
            nextOtherUserId,
            readReceiptIdsRef.current,
          ),
        ));
        setPagination(messagesResponse.data?.pagination ?? null);
        setConversationSchedules(Array.isArray(schedulesResponse.data) ? schedulesResponse.data : []);
        emitMarkSeen(selectedId);
      } catch (loadError) {
        if (!cancelled) {
          if (!isSeenWriteConflictError(loadError)) {
            setError(getApiErrorMessage(loadError, "Unable to load conversation messages."));
          }
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
          if (!response?.success && !isNonBlockingSocketMessage(response?.message)) {
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
        const normalizedMessage = normalizeBroadcastMessage(
          payload.message,
          currentUserIdRef.current,
          localOutgoingMessageIdsRef.current,
          pendingOutgoingMessagesRef.current,
        );
        const message = normalizedMessage.direction === "outgoing" && readReceiptIdsRef.current.has(getReadReceiptKey(conversationId, normalizedMessage._id))
          ? { ...normalizedMessage, isSeen: true }
          : normalizedMessage;

        setMessages((current) => mergeConversationMessages(current, [message], {
          preserveCurrentDirection: true,
          preserveCurrentSeen: true,
        }));
        if (message.direction !== "outgoing") {
          emitMarkSeen(conversationId);
        }
        void refreshConversationMessages(conversationId).catch(() => undefined);
      }

      refreshInbox();
    }

    function handleMessagesSeen(payload: InvestmentMessagesSeenPayload) {
      if (payload.conversationId !== selectedIdRef.current) {
        return;
      }

      const seenMessageIds = getSeenMessageIds(payload);
      const seenById = (
        payload.seenByUserId ??
        payload.readByUserId ??
        payload.userId ??
        getParticipantId(payload.seenBy) ??
        getParticipantId(payload.readBy)
      );
      const seenByCurrentUser = Boolean(seenById && seenById === currentUserIdRef.current);
      const likelyLocalReceipt = !seenById && !seenMessageIds.size && Date.now() - (lastMarkSeenAtRef.current[payload.conversationId] ?? 0) < 1500;
      const nextReadReceiptIds = new Set(readReceiptIdsRef.current);
      const canMarkOutgoingSeen = !seenByCurrentUser && !likelyLocalReceipt;

      setMessages((current) => current.map((message) => (
        (seenMessageIds.size ? seenMessageIds.has(message._id) : message.direction === "outgoing")
          ? {
              ...message,
              isSeen: message.direction === "outgoing"
                ? Boolean(message.isSeen || canMarkOutgoingSeen)
                : true,
            }
          : message
      )).map((message) => {
        if (message.direction === "outgoing" && message.isSeen) {
          nextReadReceiptIds.add(getReadReceiptKey(payload.conversationId ?? selectedIdRef.current, message._id));
        }

        return message;
      }));
      readReceiptIdsRef.current = nextReadReceiptIds;
      persistStoredReadReceipts(nextReadReceiptIds);
    }

    function handleMeetingRequest(payload: InvestmentMeetingRequestPayload) {
      if (!payload.conversationId || payload.conversationId === selectedIdRef.current) {
        void refreshConversationSchedules(selectedIdRef.current).catch(() => undefined);
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
  }, [emitMarkSeen, loadInbox, refreshConversationMessages, refreshConversationSchedules]);

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
        if (!response?.success && !isNonBlockingSocketMessage(response?.message)) {
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
      setMessages((current) => mergeConversationMessages(
        current,
        normalizeOutgoingSeenStatus(
          normalizeLoadedMessageDirections(
            response.data?.messages ?? [],
            currentUserIdRef.current,
          ),
          selectedId,
          otherUserIdRef.current,
          readReceiptIdsRef.current,
        ),
      ));
      setPagination(response.data?.pagination ?? pagination);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load older messages."));
    }
  }

  async function sendMessageWithHttpFallback(message: string) {
    const response = await sendConversationMessage(selectedId, message);
    const sentMessage = response.data?.message
      ? {
          ...normalizeSocketMessage(response.data.message, currentUserIdRef.current, otherUserIdRef.current, "outgoing"),
          isSeen: false,
        }
      : undefined;

    if (sentMessage) {
      localOutgoingMessageIdsRef.current.add(sentMessage._id);
      pendingOutgoingMessagesRef.current = pendingOutgoingMessagesRef.current.filter((pendingMessage) => pendingMessage.text !== message);
      setMessages((current) => mergeConversationMessages(current, [sentMessage], {
        preserveCurrentDirection: true,
        preserveCurrentSeen: true,
      }));
    }

    setDraft("");
    void loadInbox(selectedId, { silent: true });
  }

  async function handleSend() {
    const message = draft.trim();
    const socket = socketRef.current;

    if (!selectedId || !message || sending) {
      return;
    }

    setSending(true);
    setError("");
    pendingOutgoingMessagesRef.current = [
      ...pendingOutgoingMessagesRef.current.filter((pendingMessage) => Date.now() - pendingMessage.sentAt < 15000),
      { sentAt: Date.now(), text: message },
    ];

    if (!socket?.connected) {
      try {
        await sendMessageWithHttpFallback(message);
      } catch (sendError) {
        setError(getApiErrorMessage(sendError, "Unable to send message. Please try again."));
      } finally {
        setSending(false);
      }

      return;
    }

    let acknowledged = false;
    const timeoutId = window.setTimeout(() => {
      if (acknowledged) {
        return;
      }

      acknowledged = true;

      void sendMessageWithHttpFallback(message)
        .catch((sendError) => {
          setError(getApiErrorMessage(sendError, "Message send timed out. Please try again."));
        })
        .finally(() => {
          setSending(false);
        });
    }, 10000);

    socket.emit(
      INVESTMENT_SOCKET_EVENTS.sendMessage,
      {
        conversationId: selectedId,
        message,
      },
      (response: InvestmentSocketAck) => {
        if (acknowledged) {
          return;
        }

        acknowledged = true;
        window.clearTimeout(timeoutId);

        if (!response?.success) {
          setError(response?.message ?? "Unable to send message.");
          setSending(false);
          return;
        }

        const sentMessage = response.data?.message
          ? {
              ...normalizeSocketMessage(response.data.message, currentUserIdRef.current, otherUserIdRef.current, "outgoing"),
              isSeen: false,
            }
          : undefined;

        if (sentMessage) {
          localOutgoingMessageIdsRef.current.add(sentMessage._id);
          pendingOutgoingMessagesRef.current = pendingOutgoingMessagesRef.current.filter((pendingMessage) => pendingMessage.text !== message);
          setMessages((current) => mergeConversationMessages(current, [sentMessage], {
            preserveCurrentDirection: true,
            preserveCurrentSeen: true,
          }));
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
    if (!canCreateSchedules || !selectedId || scheduleSaving) {
      return;
    }

    const startsAt = buildIsoFromLocal(scheduleForm.date, scheduleForm.startTime);
    const endsAt = buildIsoFromLocal(scheduleForm.date, scheduleForm.endTime);

    if (!startsAt || !endsAt || new Date(endsAt) <= new Date(startsAt)) {
      setScheduleMessage("Please choose a valid start and end time.");
      return;
    }

    if (!scheduleForm.location.trim()) {
      setScheduleMessage("Please provide a location.");
      return;
    }

    setScheduleSaving(true);
    setScheduleMessage("");

    try {
      const response = await createSchedule({
        conversationId: selectedId,
        dateTime: startsAt,
        endsAt,
        location: scheduleForm.location.trim(),
        locationDetails: scheduleForm.locationDetails.trim() || undefined,
        note: scheduleForm.note.trim() || undefined,
        startsAt,
        timeZone: scheduleForm.timeZone.trim() || "UTC",
        title: scheduleForm.title.trim() || "Investment Meeting",
      });
      const savedSchedule = response.data
        ? {
            ...response.data,
            createdAt: response.data.createdAt ?? new Date().toISOString(),
            createdBy: response.data.createdBy ?? (currentUser.id ? { _id: currentUser.id, role: viewerRole } : undefined),
          }
        : null;

      if (savedSchedule?._id) {
        setConversationSchedules((current) => mergeSchedules(current, [savedSchedule]));
      } else {
        void refreshConversationSchedules(selectedId).catch(() => undefined);
      }

      setScheduleMessage("Schedule created.");
      setScheduleOpen(false);
      void loadInbox(selectedId, { silent: true });
    } catch (scheduleError) {
      setScheduleMessage(getApiErrorMessage(scheduleError, "Unable to create schedule."));
    } finally {
      setScheduleSaving(false);
    }
  }

  async function openScheduleDetails(schedule: Schedule) {
    setActiveSchedule(schedule);
    setScheduleDetailError("");
    setScheduleDetailOpen(true);

    if (!schedule._id) {
      return;
    }

    setLoadingScheduleDetail(true);

    try {
      const response = await getSchedule(schedule._id);
      setActiveSchedule(response.data ?? schedule);
    } catch (detailError) {
      setScheduleDetailError(getApiErrorMessage(detailError, "Unable to load schedule details."));
    } finally {
      setLoadingScheduleDetail(false);
    }
  }

  const activeScheduleStart = activeSchedule ? getScheduleStart(activeSchedule) : "";
  const activeScheduleDateLabel = formatScheduleDate(activeScheduleStart);
  const activeScheduleTimeLabel = formatScheduleTimeRange(activeSchedule);

  return (
    <section className="flex h-[calc(100dvh-2rem)] min-h-0 flex-col overflow-hidden rounded-2xl bg-[#FCFCFD] sm:h-[calc(100dvh-3rem)] xl:h-[calc(100dvh-4rem)]">
      <div className="mb-6 flex min-h-[72px] shrink-0 items-start justify-between gap-6">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <h1 className="w-full font-[family-name:var(--font-manrope)] text-[32px] font-semibold leading-10 text-[#16123E]">
            Message
          </h1>
          <p className="font-[family-name:var(--font-manrope)] text-base font-medium leading-7 text-[#6B7280]">
            See all messages in here
          </p>
        </div>

      </div>

      {error ? (
        <div className="mb-4 shrink-0 rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
          {error}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
          <aside className={cx(
            "sticky left-0 top-0 h-full min-h-0 w-full lg:w-[320px] shrink-0 flex-col overflow-hidden rounded-l-2xl border-r border-[#E2E8F0] bg-white",
            selectedId ? "hidden lg:flex" : "flex"
          )}>
            <div className="flex h-[53px] shrink-0 items-center justify-center gap-2 border-b border-[#E2E8F0] p-3">
              <div className="flex w-full items-center gap-2 text-xs font-medium leading-4 text-[#6B7280]">
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
                      "flex h-7 flex-1 items-center justify-center rounded-md px-2 text-center transition",
                      filter === item.value && "bg-[#E7EAEE] text-[#1F2937]",
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
                      "flex h-[81px] w-full items-start gap-3 border-b border-[#E2E8F0] px-4 py-4 text-left transition",
                      selectedId === conversation.conversationId ? "bg-[#F8FAFC]" : "hover:bg-[#F8FAFC]",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex h-5 items-start justify-between gap-3">
                        <p className="line-clamp-1 min-w-0 max-w-[177px] text-sm font-normal leading-5 text-[#0F172A]">
                          {getConversationTitle(conversation)}
                        </p>
                        <div className="flex items-center gap-2">
                          {conversation.unseenMessageCount ? (
                            <span className="inline-flex h-[19px] min-w-[21px] items-center justify-center rounded-lg bg-[#454070] px-2 text-[10px] font-medium leading-[15px] text-white">
                              {conversation.unseenMessageCount}
                            </span>
                          ) : null}
                          <span className="text-xs font-normal leading-4 text-[#64748B]">
                            {conversation.timeAgo || formatMessageTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-1 text-xs font-normal leading-4 text-[#64748B]">
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

          <div className={cx(
            "min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F8FAFC]",
            selectedId ? "flex" : "hidden lg:flex"
          )}>
            {selectedId ? (
              <>
                <div className="box-border flex min-h-[112px] shrink-0 items-start justify-between gap-6 rounded-tr-xl border-b border-[#E2E8F0] bg-white px-6 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                  <div className="flex min-h-[80px] min-w-0 flex-1 flex-col items-start gap-4">
                    <div className="flex h-[26px] w-full items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedId("")}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#DEE6F1] bg-white text-[#2B425D] lg:hidden mr-1"
                        aria-label="Back to conversations"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m15 19-7-7 7-7" />
                        </svg>
                      </button>
                      <h2 className="flex h-[26px] max-w-[340px] min-w-0 items-center pr-8 font-[family-name:var(--font-manrope)] text-lg font-semibold leading-[26px] text-[#16123E]">
                        <span className="truncate">{activeTitle}</span>
                      </h2>
                    </div>

                    <div className="flex w-full flex-wrap items-center justify-between gap-x-8 gap-y-3">
                      <div className="flex h-8 flex-wrap items-center gap-2 font-sans text-[#6B7280]">
                        {visibleActiveList?.country ? (
                          <>
                            <span className="inline-flex h-5 items-center gap-1 text-xs font-normal leading-5 tracking-[0.01em]">
                              <DashboardIcon name="website" className="h-5 w-5" />
                              {visibleActiveList.country}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-[#BFC7D0]" />
                          </>
                        ) : null}

                        {typeof visibleActiveList?.viewCount === "number" ? (
                          <>
                            <span className="inline-flex h-5 items-center gap-1 text-sm font-medium leading-[19px]">
                              <DashboardIcon name="views" className="h-5 w-5" />
                              {visibleActiveList.viewCount.toLocaleString("en-US")} views
                            </span>
                            <span className="h-1 w-1 rounded-full bg-[#BFC7D0]" />
                          </>
                        ) : null}

                        {activeListId ? (
                          <Link
                            href={`${dashboardBase}/pitch/${activeListId}`}
                            className="inline-flex h-8 min-w-8 items-center justify-center gap-2 rounded-lg border border-[#CCCCCC] bg-[#E5E7EB] px-4 font-sans text-sm font-medium leading-[22px] text-[#1F2937] transition hover:bg-[#DDE1E7]"
                          >
                            Preview Pitch
                          </Link>
                        ) : null}
                      </div>

                      <div className="flex h-[26px] flex-wrap items-center gap-4">
                        <div className="flex h-[26px] items-center gap-[13px]">
                          {visibleActiveList?.stage ? (
                            <span className="inline-flex h-[26px] items-center justify-center rounded-full bg-[#BFC7D0] px-5 font-sans text-sm font-normal leading-[22px] text-[#1F2937]">
                              {visibleActiveList.stage}
                            </span>
                          ) : null}
                          {visibleActiveList?.sector ? (
                            <span className="inline-flex h-[26px] items-center justify-center rounded-full bg-[#BFC7D0] px-5 font-sans text-sm font-normal leading-[22px] text-[#1F2937]">
                              {visibleActiveList.sector}
                            </span>
                          ) : null}
                        </div>

                        {activeFundingTarget ? (
                          <div className="flex h-6 items-center gap-3 font-sans">
                            <span className="text-xs font-normal leading-[10px] text-[#6B7280]">Funding target</span>
                            <span className="text-lg font-medium leading-6 text-[#2B425D]">{activeFundingTarget}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                  </div>

                  <div className="inline-flex h-8 shrink-0 items-center gap-2 rounded-full border border-[#E7ECF3] bg-[#F8FAFC] px-4 font-sans text-xs text-[#6B7280]">
                    <DashboardIcon name="spark" className="h-4 w-4 text-[#ED6A06]" />
                    {socketConnected ? "Live conversation" : "Connecting live chat"}
                  </div>
                </div>

                <div ref={messageListRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-6 py-4">
                  {loadingConversation ? (
                    <div className="flex h-full min-h-[420px] items-center justify-center text-sm text-[#667085]">
                      Loading messages...
                    </div>
                  ) : timelineItems.length ? (
                    <div className="flex flex-col gap-4">
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

                      {timelineItems.map((timelineItem) => {
                        if (timelineItem.kind === "schedule") {
                          const schedule = timelineItem.item;
                          const outgoing = isScheduleOutgoing(schedule, currentUser.id);
                          const scheduleTime = formatMessageTime(schedule.createdAt ?? schedule.updatedAt ?? getScheduleStart(schedule));

                          return (
                            <div
                              key={timelineItem.id}
                              className={cx(
                                "flex w-full max-w-[507px] flex-col gap-1 font-sans",
                                outgoing ? "ml-auto items-end" : "mr-auto items-start",
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  void openScheduleDetails(schedule);
                                }}
                                className="inline-flex min-h-[52px] w-[152px] items-center gap-2 rounded-md bg-[#F8F5EF] px-3 py-2 text-left shadow-sm transition hover:bg-[#F1ECE3] focus:outline-none focus:ring-2 focus:ring-[#ED6A06]/35"
                              >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-[#2B425D]">
                                  <DashboardIcon name="schedule" className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-xs font-semibold leading-4 text-[#111111]">
                                    Schedule
                                  </span>
                                  <span className="block truncate text-[9px] font-normal leading-3 text-[#6B7280]">
                                    Set if you are available or not
                                  </span>
                                </span>
                              </button>
                              {scheduleTime ? (
                                <span className="px-1 text-[10px] font-normal leading-4 text-[#8A8A8A]">
                                  {scheduleTime}
                                </span>
                              ) : null}
                            </div>
                          );
                        }

                        const message = timelineItem.item;
                        const outgoing = message.direction === "outgoing";
                        const isRestricted = message.isRestricted || message.moderationStatus === "restricted";
                        const senderName = getMessageSenderName(
                          message,
                          selectedConversation,
                          activeConversation,
                          currentUser.id,
                          viewerRole,
                        );

                        return (
                          <div
                            id={`message-${message._id}`}
                            key={timelineItem.id}
                            className={cx(
                              "flex w-full max-w-[507px] min-w-0 flex-col justify-center gap-2 px-8 py-3 font-sans shadow-sm",
                              outgoing
                                ? "ml-auto rounded-[40px_0px_40px_40px] border border-transparent bg-[#E7EAEE]"
                                : "mr-auto rounded-[0px_40px_40px_40px] border border-[#777777] bg-white",
                              targetMessageId === message._id && "ring-2 ring-[#ED6A06] ring-offset-2",
                            )}
                          >
                            {!outgoing ? (
                              <p className="font-sans text-base font-semibold leading-6 tracking-[0.015em] text-[#111111]">
                                {senderName}
                              </p>
                            ) : null}
                            {outgoing ? (
                              <p className="sr-only">
                                You
                              </p>
                            ) : null}
                            <p className="max-w-full whitespace-pre-wrap break-all font-sans text-base font-normal leading-6 text-[#111111] [overflow-wrap:anywhere]">
                              {message.message}
                            </p>
                            {isRestricted ? (
                              <div className="rounded-[10px] border border-[#F7C98B] bg-[#FFF7ED] px-3 py-2 text-xs font-medium leading-5 text-[#9A4B00]">
                                {outgoing
                                  ? "Restricted: this message was saved, but hidden from the receiver because it includes contact or off-platform communication details."
                                  : "Restricted message visible to superadmin only."}
                                {message.moderationReasons?.length ? (
                                  <span className="mt-1 block font-normal text-[#B45309]">
                                    {message.moderationReasons.join(", ")}
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
                            <div className="flex h-5 items-center justify-between gap-8 font-sans text-xs uppercase leading-5 tracking-[0.05em] text-[#777777]">
                              <span>{formatMessageTime(message.sentAt)}</span>
                              {outgoing ? <MessageStatus seen={message.isSeen} /> : null}
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

                <div className="sticky bottom-0 z-10 flex min-h-[160px] shrink-0 items-center justify-center border-t border-[#EEF2F7] bg-white px-4 py-4 sm:px-6">
                  <div className="flex h-[132px] w-full max-w-[907px] flex-col rounded-2xl border border-[#9CA3AF] bg-white p-2">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onFocus={() => {
                        if (selectedId) {
                          emitMarkSeen(selectedId);
                        }
                      }}
                      placeholder="Type here..."
                      className="min-h-0 flex-1 resize-none rounded-2xl border-0 bg-transparent px-4 py-2 font-[family-name:var(--font-manrope)] text-base leading-[120%] tracking-normal text-[#16123E] outline-none placeholder:text-[#6B7280]"
                    />
                    <div className="flex h-10 items-center justify-between gap-5 px-2 pb-2">
                      {canCreateSchedules ? (
                        <button
                          type="button"
                          onClick={openScheduleModal}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#213448] transition hover:bg-[#F3F4F6]"
                          aria-label="Open schedule"
                        >
                          <DashboardIcon name="calendar" className="h-6 w-6" />
                        </button>
                      ) : null}

                      <div className="flex items-center gap-5">
                        {viewerRole !== "superadmin" ? (
                          <Link
                            href={`${dashboardBase}/upgrade-plan`}
                            className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#E65E02] px-4 font-sans text-sm font-medium leading-[22px] text-[#F9FAFB] transition hover:bg-[#d45602]"
                          >
                            Ready to invest
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            void handleSend();
                          }}
                          disabled={sending || !draft.trim()}
                          className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#2B425D] px-4 font-sans text-sm font-medium leading-[22px] text-[#F9FAFB] transition hover:bg-[#213448] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {sending ? "Sending..." : "Send"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[520px] flex-col items-center justify-center bg-white p-8 text-center">
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

      {scheduleDetailOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/35 p-4"
          onClick={() => setScheduleDetailOpen(false)}
        >
          <div
            className="w-full max-w-[480px] rounded-[18px] bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-[#1E2746]">
                  {activeSchedule?.title || "Scheduled meeting"}
                </h2>
                {loadingScheduleDetail ? <p className="mt-1 text-xs text-[#6B7280]">Loading details...</p> : null}
                {scheduleDetailError ? <p className="mt-1 text-xs text-[#B42318]">{scheduleDetailError}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => setScheduleDetailOpen(false)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F3F5F8]"
                aria-label="Close schedule details"
              >
                x
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="inline-flex items-center gap-2 text-sm text-[#1F2937]">
                <DashboardIcon name="schedule" className="h-5 w-5" />
                {activeScheduleDateLabel || "Date not provided"}
              </div>

              <div className="rounded-[12px] bg-[#F4F6FB] px-3 py-2 text-sm text-[#1F2937]">
                {activeScheduleTimeLabel || "Time not provided"}
              </div>

              <div className="rounded-[12px] border border-[#E6EBF3] px-3 py-2 text-sm text-[#1F2937]">
                <p className="text-xs text-[#6B7280]">Location</p>
                <p className="mt-1 font-medium text-[#1E2746]">{activeSchedule?.location || "Location not provided"}</p>
                {activeSchedule?.locationDetails ? (
                  <p className="mt-1 text-xs text-[#6B7280]">{activeSchedule.locationDetails}</p>
                ) : null}
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-[12px] border border-[#E6EBF3] px-3 py-2">
                  <p className="text-xs text-[#6B7280]">Investor</p>
                  <p className="mt-1 font-medium text-[#1E2746]">{formatScheduleParticipant(activeSchedule?.investor)}</p>
                </div>
                <div className="rounded-[12px] border border-[#E6EBF3] px-3 py-2">
                  <p className="text-xs text-[#6B7280]">Investee</p>
                  <p className="mt-1 font-medium text-[#1E2746]">{formatScheduleParticipant(activeSchedule?.investee)}</p>
                </div>
              </div>

              {activeSchedule?.note ? (
                <div className="rounded-[12px] bg-[#F4F6FB] px-3 py-2 text-sm text-[#475467]">
                  {activeSchedule.note}
                </div>
              ) : null}

              <p className="text-xs text-[#6B7280]">
                Time zone: {activeSchedule?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

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
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#1E2746]">Schedule Meeting</h2>
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
                {scheduleSaving ? "Saving..." : "Create Schedule"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
