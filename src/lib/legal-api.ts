import { apiRequest, type ApiSuccessResponse } from "./api";

export type LegalContentType = "privacy-policy" | "terms-and-conditions";

export type LegalContentPayload = {
  content: string;
  title: string;
  type: LegalContentType;
};

export type LegalContentResponse = ApiSuccessResponse<{
  _id?: string;
  content?: string;
  title?: string;
  type?: LegalContentType;
}>;

export function createLegalContent(payload: LegalContentPayload) {
  return apiRequest<LegalContentResponse>({
    data: payload,
    method: "POST",
    url: "legal-contents",
  });
}
