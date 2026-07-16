import { API_BASE_URL } from "./api-config";
import { apiRequest, type ApiSuccessResponse } from "./api";

export type ReviewPayload = {
  avatarImage?: string;
  isVisible?: boolean;
  name: string;
  quote: string;
  rating?: number;
  role?: string;
  sortOrder?: number;
};

export type Review = ReviewPayload & {
  _id?: string;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ReviewsResponse = ApiSuccessResponse<Review[] | { reviews?: Review[] }>;
export type ReviewResponse = ApiSuccessResponse<Review>;
export type DeleteReviewResponse = ApiSuccessResponse<Review | null>;

function getApiUrl(path: string) {
  const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  return new URL(path, baseUrl).toString();
}

function normalizeReviewsPayload(data: ReviewsResponse["data"]) {
  if (Array.isArray(data)) {
    return data;
  }

  return data.reviews ?? [];
}

export function getReviews() {
  return apiRequest<ReviewsResponse>({
    method: "GET",
    url: "reviews/admin",
  });
}

export function createReview(payload: ReviewPayload) {
  return apiRequest<ReviewResponse>({
    data: payload,
    method: "POST",
    url: "reviews/admin",
  });
}

export function updateReview(reviewId: string, payload: ReviewPayload) {
  return apiRequest<ReviewResponse>({
    data: payload,
    method: "PATCH",
    url: `reviews/admin/${reviewId}`,
  });
}

export function deleteReview(reviewId: string) {
  return apiRequest<DeleteReviewResponse>({
    method: "DELETE",
    url: `reviews/admin/${reviewId}`,
  });
}

export async function getPublicReviews() {
  const response = await fetch(getApiUrl("reviews"), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Reviews request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ReviewsResponse;

  if (payload.success === false) {
    throw new Error(payload.message ?? "Reviews response was invalid");
  }

  return normalizeReviewsPayload(payload.data);
}
