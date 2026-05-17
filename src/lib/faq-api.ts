import { API_BASE_URL, apiRequest, type ApiSuccessResponse } from "./api";

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

function getApiUrl(path: string) {
  const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  return new URL(path, baseUrl).toString();
}

function normalizeFaqsPayload(data: FaqsResponse["data"]) {
  if (Array.isArray(data)) {
    return data;
  }

  return data.faqs ?? [];
}

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

export async function getPublicFaqs() {
  const response = await fetch(getApiUrl("faqs"), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`FAQs request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as FaqsResponse;

  if (payload.success === false) {
    throw new Error(payload.message ?? "FAQs response was invalid");
  }

  return normalizeFaqsPayload(payload.data);
}
