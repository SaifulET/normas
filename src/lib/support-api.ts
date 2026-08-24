import { apiRequest, type ApiSuccessResponse } from "./api";

export type SupportRequestPayload = {
  email: string;
  message: string;
  name?: string;
  subject: string;
};

export type SupportRequestResponse = ApiSuccessResponse<unknown>;

export type SupportStatus = "pending" | "dismissed" | "resolved" | string;

export type ChatAttachment = {
  key: string;
  mimeType: string;
  originalName: string;
  size: number;
  url: string;
};

export type SupportMessage = {
  _id: string;
  attachments?: ChatAttachment[];
  message: string;
  messageStatus?: "sent" | "seen" | string;
  seenAt?: string | null;
  senderEmail?: string;
  senderName?: string;
  senderType?: "guest" | "user" | "superadmin" | string;
  senderUser?: string | null;
  sentAt?: string;
};

export type SupportParticipant = {
  email?: string;
  name?: string;
  role?: string;
};

export type SupportConversationListItem = {
  _id: string;
  createdAt?: string;
  lastMessage?: SupportMessage | null;
  lastMessageAt?: string;
  messageCount?: number;
  participant?: SupportParticipant;
  status?: SupportStatus;
  subject?: string;
  updatedAt?: string;
};

export type SupportConversation = {
  _id: string;
  createdAt?: string;
  guestEmail?: string;
  guestName?: string;
  lastMessageAt?: string;
  messages?: SupportMessage[];
  seenMessageIds?: string[];
  status?: SupportStatus;
  subject?: string;
  updatedAt?: string;
  user?: SupportParticipant | string | null;
};

type SupportConversationsResponse = ApiSuccessResponse<{
  conversations?: SupportConversationListItem[];
  pagination?: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}>;

type SupportConversationResponse = ApiSuccessResponse<SupportConversation>;

type SupportMessageResponse = ApiSuccessResponse<{
  conversation?: SupportConversation;
  message?: SupportMessage;
  room?: string;
}>;

export function submitSupportRequest(payload: SupportRequestPayload) {
  return apiRequest<SupportRequestResponse>({
    data: payload,
    method: "POST",
    url: "support",
  });
}

export function getSupportConversations(params: { limit?: number; page?: number; search?: string; status?: string } = {}) {
  return apiRequest<SupportConversationsResponse>({
    method: "GET",
    params,
    url: "support",
  });
}

export function getSupportConversation(conversationId: string) {
  return apiRequest<SupportConversationResponse>({
    method: "GET",
    url: `support/${conversationId}`,
  });
}

export function getMySupportConversations() {
  return apiRequest<ApiSuccessResponse<SupportConversation[]>>({
    method: "GET",
    url: "support/my-messages",
  });
}

export function getMySupportConversation(conversationId: string) {
  return apiRequest<SupportConversationResponse>({
    method: "GET",
    url: `support/my-messages/${conversationId}`,
  });
}

export function uploadSupportAttachment(conversationId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<ApiSuccessResponse<ChatAttachment>>({
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    method: "POST",
    url: `support/${conversationId}/attachments`,
  });
}

export function deleteSupportAttachment(conversationId: string, key: string) {
  return apiRequest<SupportConversationResponse>({
    data: { key },
    method: "DELETE",
    url: `support/${conversationId}/attachments`,
  });
}

export function sendSupportMessage(conversationId: string, message: string, attachments: ChatAttachment[] = []) {
  return apiRequest<SupportMessageResponse>({
    data: { attachments, message },
    method: "POST",
    url: `support/${conversationId}/messages`,
  });
}

export function updateSupportConversationStatus(conversationId: string, status: "pending" | "dismissed" | "resolved") {
  return apiRequest<SupportConversationResponse>({
    data: { status },
    method: "PATCH",
    url: `support/${conversationId}/status`,
  });
}

export function deleteSupportConversation(conversationId: string) {
  return apiRequest<ApiSuccessResponse<{ id?: string; message?: string }>>({
    method: "DELETE",
    url: `support/${conversationId}`,
  });
}
