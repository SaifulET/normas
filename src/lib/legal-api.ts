import { apiRequest, type ApiSuccessResponse } from "./api";

export type LegalContentType = "privacy-policy" | "terms-and-conditions";

export type LegalContentUpdatePayload = {
  content: string;
  title: string;
};

export type LegalContentCreatePayload = LegalContentUpdatePayload & {
  type: LegalContentType;
};

export type LegalContent = {
  _id?: string;
  content?: string;
  createdAt?: string;
  lastModifiedAt?: string;
  title?: string;
  type?: LegalContentType;
  updatedAt?: string;
};

export type LegalContentResponse = ApiSuccessResponse<LegalContent>;

export type LegalContentByTypeResponse = ApiSuccessResponse<LegalContent | LegalContent[] | null>;

export type DeleteLegalContentResponse = ApiSuccessResponse<LegalContent | null>;

export function createLegalContent(payload: LegalContentCreatePayload) {
  return apiRequest<LegalContentResponse>({
    data: payload,
    method: "POST",
    url: "legal-contents",
  });
}

export function updateLegalContent(contentId: string, payload: LegalContentUpdatePayload) {
  return apiRequest<LegalContentResponse>({
    data: payload,
    method: "PATCH",
    url: `legal-contents/${contentId}`,
  });
}

export function deleteLegalContent(contentId: string) {
  return apiRequest<DeleteLegalContentResponse>({
    method: "DELETE",
    url: `legal-contents/${contentId}`,
  });
}

export function getLegalContentByType(type: LegalContentType) {
  return apiRequest<LegalContentByTypeResponse>({
    method: "GET",
    url: `legal-contents/type/${type}`,
  });
}
