import { apiRequest, type ApiSuccessResponse } from "./api";

export type FaqPayload = {
  answer: string;
  question: string;
};

export type Faq = FaqPayload & {
  _id?: string;
  id?: string;
};

export type FaqsResponse = ApiSuccessResponse<Faq[] | { faqs?: Faq[] }>;
export type FaqResponse = ApiSuccessResponse<Faq>;
export type DeleteFaqResponse = ApiSuccessResponse<Faq | null>;

export function getFaqs() {
  return apiRequest<FaqsResponse>({
    method: "GET",
    url: "faqs",
  });
}

export function createFaq(payload: FaqPayload) {
  return apiRequest<FaqResponse>({
    data: payload,
    method: "POST",
    url: "faqs",
  });
}

export function updateFaq(faqId: string, payload: FaqPayload) {
  return apiRequest<FaqResponse>({
    data: payload,
    method: "PATCH",
    url: `faqs/${faqId}`,
  });
}

export function deleteFaq(faqId: string) {
  return apiRequest<DeleteFaqResponse>({
    method: "DELETE",
    url: `faqs/${faqId}`,
  });
}
