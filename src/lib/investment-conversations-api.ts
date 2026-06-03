import { apiRequest } from "./api";

export type ConversationStatus = "pending" | "active";
export type MeetingRequestStatus = "pending" | "accepted" | "rejected" | "cancelled";

export type ConversationUserInfo = {
  _id?: string;
  companyName?: string;
  displayName?: string;
  email?: string;
  firstName?: string;
  fullLegalName?: string;
  fullName?: string;
  id?: string;
  lastName?: string;
  name?: string;
  personalIdentity?: {
    fullLegalName?: string;
  };
  profileImage?: string;
  profile?: {
    displayName?: string;
    fullName?: string;
    name?: string;
  };
  role?: string;
  username?: string;
};

export type ConversationSeenByEntry =
  | string
  | ConversationUserInfo
  | {
      seenAt?: string;
      user?: string | ConversationUserInfo;
    };

export type ConversationListInfo = {
  _id?: string;
  title?: string;
};

export type ConversationMessage = {
  _id: string;
  author?: ConversationSeenByEntry;
  authorId?: string;
  authorRole?: string;
  createdBy?: ConversationSeenByEntry;
  createdById?: string;
  createdByRole?: string;
  direction?: "incoming" | "outgoing" | string;
  from?: ConversationSeenByEntry;
  fromId?: string;
  fromRole?: string;
  isSeen?: boolean;
  isRestricted?: boolean;
  message: string;
  moderationReasons?: string[];
  moderationStatus?: "approved" | "restricted" | string;
  readAt?: string;
  readBy?: ConversationSeenByEntry[];
  receiver?: ConversationSeenByEntry;
  receiverId?: string;
  recipient?: ConversationSeenByEntry;
  recipientId?: string;
  seenBy?: ConversationSeenByEntry[];
  seenByIds?: string[];
  seenByUsers?: ConversationSeenByEntry[];
  seenAt?: string;
  senderRole?: string;
  senderType?: string;
  sender?: ConversationSeenByEntry;
  senderId?: string;
  senderInfo?: ConversationSeenByEntry;
  sentBy?: ConversationSeenByEntry;
  sentById?: string;
  sentByRole?: string;
  sentAt?: string;
  userRole?: string;
  user?: ConversationSeenByEntry;
  userId?: string;
};

export type InvestmentConversation = {
  _id: string;
  admin?: ConversationUserInfo;
  adminInfo?: ConversationUserInfo;
  conversationStatus?: ConversationStatus | string;
  investee?: ConversationUserInfo;
  investeeInfo?: ConversationUserInfo;
  investor?: ConversationUserInfo;
  investorInfo?: ConversationUserInfo;
  lastMessageAt?: string;
  list?: ConversationListInfo;
  messages?: ConversationMessage[];
  otherUserInfo?: ConversationUserInfo;
  participants?: ConversationUserInfo[];
  unreadCount?: number;
  users?: ConversationUserInfo[];
};

export type SidebarConversation = {
  admin?: ConversationUserInfo;
  adminInfo?: ConversationUserInfo;
  conversationId: string;
  conversationStatus?: ConversationStatus | string;
  investee?: ConversationUserInfo;
  investeeInfo?: ConversationUserInfo;
  investor?: ConversationUserInfo;
  investorInfo?: ConversationUserInfo;
  lastIncomingMessage?: ConversationMessage;
  lastIncomingMessagePreview?: string;
  lastMessageTime?: string;
  listInfo?: ConversationListInfo;
  otherUserInfo?: ConversationUserInfo;
  participants?: ConversationUserInfo[];
  timeAgo?: string;
  unseenMessageCount?: number;
  users?: ConversationUserInfo[];
};

export type ConversationMessagePagination = {
  hasMore?: boolean;
  limitMessages?: number;
  limitPairs?: number;
  loadedMessages?: number;
  nextPage?: number;
  page?: number;
  totalMessages?: number;
};

export type ConversationMessagesData = {
  conversationId?: string;
  conversationStatus?: ConversationStatus | string;
  messages?: ConversationMessage[];
  pagination?: ConversationMessagePagination;
};

export type MeetingRequest = {
  _id: string;
  conversation?: string | InvestmentConversation;
  endsAt?: string;
  list?: ConversationListInfo;
  location?: string;
  locationDetails?: string;
  note?: string;
  responseNote?: string;
  startsAt?: string;
  status?: MeetingRequestStatus | string;
  timeZone?: string;
  title?: string;
};

export type ConversationEnvelope<T> = {
  data?: T;
  message?: string;
  success?: boolean;
};

export type CreateConversationBody = {
  initialMessage?: string;
  investeeId?: string;
  investorId?: string;
  listId: string;
};

export type CreateConversationData = {
  conversation?: InvestmentConversation;
  created?: boolean;
};

export type SendMessageData = {
  message?: ConversationMessage;
  receiverUnseenMessageCount?: number;
};

export type CreateMeetingRequestBody = {
  endsAt: string;
  location?: string;
  locationDetails?: string;
  note?: string;
  startsAt: string;
  timeZone?: string;
  title: string;
};

export type MeetingRequestFilters = {
  conversationId?: string;
  from?: string;
  listId?: string;
  status?: MeetingRequestStatus;
  to?: string;
};

export function createOrGetInvestmentConversation(data: CreateConversationBody) {
  return apiRequest<ConversationEnvelope<CreateConversationData>>({
    data,
    method: "POST",
    url: "investment-conversations",
  });
}

export function getInvestmentConversations(status?: ConversationStatus) {
  return apiRequest<ConversationEnvelope<InvestmentConversation[]>>({
    method: "GET",
    params: status ? { status } : undefined,
    url: "investment-conversations",
  });
}

export function getConversationSidebar(status?: ConversationStatus) {
  return apiRequest<ConversationEnvelope<SidebarConversation[]>>({
    method: "GET",
    params: status ? { status } : undefined,
    url: "investment-conversations/sidebar",
  });
}

export function getConversationRequests() {
  return apiRequest<ConversationEnvelope<InvestmentConversation[]>>({
    method: "GET",
    url: "investment-conversations/requests",
  });
}

export function getInvestmentConversation(conversationId: string) {
  return apiRequest<ConversationEnvelope<InvestmentConversation>>({
    method: "GET",
    url: `investment-conversations/${conversationId}`,
  });
}

export function markConversationSeen(conversationId: string) {
  return apiRequest<ConversationEnvelope<unknown>>({
    data: {},
    method: "PATCH",
    url: `investment-conversations/${conversationId}/seen`,
  });
}

export function sendConversationMessage(conversationId: string, message: string) {
  return apiRequest<ConversationEnvelope<SendMessageData>>({
    data: { message },
    method: "POST",
    url: `investment-conversations/${conversationId}/messages`,
  });
}

export function getConversationMessages(conversationId: string, page = 1, limitPairs = 5) {
  return apiRequest<ConversationEnvelope<ConversationMessagesData>>({
    method: "GET",
    params: { limitPairs, page },
    url: `investment-conversations/${conversationId}/messages`,
  });
}

export function createMeetingRequest(conversationId: string, data: CreateMeetingRequestBody) {
  return apiRequest<ConversationEnvelope<MeetingRequest>>({
    data,
    method: "POST",
    url: `investment-conversations/${conversationId}/meeting-requests`,
  });
}

export function getConversationMeetingRequests(conversationId: string, status?: MeetingRequestStatus) {
  return apiRequest<ConversationEnvelope<MeetingRequest[]>>({
    method: "GET",
    params: status ? { status } : undefined,
    url: `investment-conversations/${conversationId}/meeting-requests`,
  });
}

export function getMeetingRequests(params: MeetingRequestFilters = {}) {
  return apiRequest<ConversationEnvelope<MeetingRequest[]>>({
    method: "GET",
    params,
    url: "investment-conversations/meeting-requests",
  });
}

export function updateMeetingRequestStatus(
  meetingRequestId: string,
  data: { responseNote?: string; status: Exclude<MeetingRequestStatus, "pending"> },
) {
  return apiRequest<ConversationEnvelope<MeetingRequest>>({
    data,
    method: "PATCH",
    url: `investment-conversations/meeting-requests/${meetingRequestId}/status`,
  });
}

export function getSchedules(params: MeetingRequestFilters = {}) {
  return apiRequest<ConversationEnvelope<MeetingRequest[]>>({
    method: "GET",
    params,
    url: "investment-conversations/schedules",
  });
}

export function getSchedule(meetingRequestId: string) {
  return apiRequest<ConversationEnvelope<MeetingRequest>>({
    method: "GET",
    url: `investment-conversations/schedules/${meetingRequestId}`,
  });
}
