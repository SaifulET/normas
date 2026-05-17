import { apiRequest, type ApiSuccessResponse } from "./api";

export type SupportRequestPayload = {
  email: string;
  message: string;
  subject: string;
};

export type SupportRequestResponse = ApiSuccessResponse<unknown>;

export function submitSupportRequest(payload: SupportRequestPayload) {
  return apiRequest<SupportRequestResponse>({
    data: payload,
    method: "POST",
    url: "support",
  });
}
