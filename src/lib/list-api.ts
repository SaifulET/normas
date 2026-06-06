import { apiRequest } from "./api";

export type ListMutationResponse = {
  data?: ListItemResponse;
  message?: string;
  success?: boolean;
};

export type ListStatus = "pending" | "activated" | "deactivated" | "suspended" | "under_review";
export type ListStatusAction = ListStatus | "rejected";
export type ListApprovalStatus = "pending_create" | "pending_update" | "approved" | "rejected_create" | "rejected_update";

export type ListStatusResponse = {
  data?: ListItemResponse;
  message?: string;
  status?: ListStatus | string;
  success?: boolean;
};

export type SavedListStatusResponse = {
  data?: {
    isSaved?: boolean;
    list?: string;
    savedListId?: string | null;
  };
  message?: string;
  success?: boolean;
};

export type SavedListItemResponse =
  | ListItemResponse
  | {
      _id?: string;
      createdAt?: string;
      list?: ListItemResponse | string;
      listId?: ListItemResponse | string;
      updatedAt?: string;
    };

export type SavedListsResponse =
  | SavedListItemResponse[]
  | {
      data?: SavedListItemResponse[];
      message?: string;
      success?: boolean;
    };

export type ListUser = {
  _id?: string;
  email?: string;
  name?: string;
  role?: string;
};

export type ListAdditionalDetail = {
  key?: string;
  value?: string;
};

export type ListItemResponse = {
  __v?: number;
  _id: string;
  additionalDetails?: ListAdditionalDetail[];
  bannerImage?: string | null;
  country?: string;
  createdAt?: string;
  description?: string;
  fundingTarget?: number;
  approvalStatus?: ListApprovalStatus | string;
  hasPendingDraft?: boolean;
  keyword?: string;
  moderationReasons?: string[];
  moderationStatus?: "approved" | "suspended" | "manual_review" | string;
  publishedContent?: Partial<ListItemResponse>;
  sector?: string;
  stage?: string;
  status?: ListStatus | string;
  title?: string;
  updatedAt?: string;
  user?: ListUser;
  viewCount?: number;
};

export type ListAiReview = {
  decision?: string;
  isRelevant?: boolean;
  label?: string;
  reasons?: string[];
  summary?: string;
};

export type ReviewListItemResponse = ListItemResponse & {
  aiReview?: ListAiReview;
};

export type ListsResponse = {
  data?: ListItemResponse[];
  message?: string;
  success?: boolean;
};

export type ListResponse = {
  data?: ListItemResponse;
  message?: string;
  success?: boolean;
};

export type ListSectorCount = {
  listAmount?: number;
  sector?: string;
};

export type ListSectorsResponse = {
  data?: {
    sectors?: ListSectorCount[];
    totalLists?: number;
    totalSectors?: number;
  };
  message?: string;
  success?: boolean;
};

export type ReviewListsResponse = {
  data?: {
    lists?: ReviewListItemResponse[];
    pagination?: {
      limit?: number;
      page?: number;
      total?: number;
      totalPages?: number;
    };
    pendingCount?: number;
  };
  message?: string;
  success?: boolean;
};

export type ReviewListResponse = {
  data?: ReviewListItemResponse;
  message?: string;
  success?: boolean;
};

export type ListFilterParams = {
  country?: string;
  limit?: number;
  maxFundingTarget?: number;
  minFundingTarget?: number;
  page?: number;
  search?: string;
  sector?: string;
  stage?: string;
};

export type FilteredListsData =
  | ListItemResponse[]
  | {
      lists?: ListItemResponse[];
      page?: number;
      total?: number;
      totalLists?: number;
      totalPages?: number;
    };

export type FilteredListsResponse = {
  data?: FilteredListsData;
  message?: string;
  page?: number;
  success?: boolean;
  total?: number;
  totalLists?: number;
  totalPages?: number;
};

export function createList(formData: FormData) {
  const temp= apiRequest<ListMutationResponse>({
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    method: "POST",
    url: "lists",
  });
  console.log(temp);
  return temp;
}

export function updateList(listId: string, formData: FormData, status: ListStatus) {
  formData.set("status", status);

  return apiRequest<ListMutationResponse>({
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    method: "PATCH",
    url: `lists/${listId}`,
  });
}

export function getLists() {
  return apiRequest<ListsResponse>({
    method: "GET",
    url: "lists",
  });
}

export function getMyLists() {
  return apiRequest<ListsResponse>({
    method: "GET",
    url: "lists/user/me",
  });
}

export function getFilteredLists(params: ListFilterParams = {}) {
  return apiRequest<FilteredListsResponse>({
    method: "GET",
    params,
    url: "lists/filter",
  });
}

export function getList(listId: string) {
  return apiRequest<ListResponse>({
    method: "GET",
    url: `lists/${listId}`,
  });
}

export function getRelatedLists(listId: string) {
  return apiRequest<ListsResponse>({
    method: "GET",
    url: `lists/related/${listId}`,
  });
}

export function getListSectors() {
  return apiRequest<ListSectorsResponse>({
    method: "GET",
    url: "lists/sectors",
  });
}

export function getSuperadminReviewLists(params: {
  approvalStatus?: string;
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
} = {}) {
  return apiRequest<ReviewListsResponse>({
    method: "GET",
    params,
    url: "lists/admin/review",
  });
}

export function getSuperadminReviewList(listId: string) {
  return apiRequest<ReviewListResponse>({
    method: "GET",
    url: `lists/admin/review/${listId}`,
  });
}

export function updateListStatus(listId: string, status: ListStatusAction) {
  return apiRequest<ListStatusResponse>({
    data: { status },
    method: "PATCH",
    url: `lists/${listId}/status`,
  });
}

export function getSavedListStatus(listId: string) {
  return apiRequest<SavedListStatusResponse>({
    method: "GET",
    url: `lists/saved/${listId}/status`,
  });
}

export function getMySavedLists() {
  return apiRequest<SavedListsResponse>({
    method: "GET",
    url: "lists/saved/me",
  });
}

export function saveList(listId: string) {
  return apiRequest<ListMutationResponse>({
    data: { listId },
    method: "POST",
    url: "lists/save",
  });
}

export function removeSavedList(listId: string) {
  return apiRequest<ListMutationResponse>({
    method: "DELETE",
    url: `lists/saved/${listId}`,
  });
}

export function deleteList(listId: string) {
  return apiRequest<ListMutationResponse>({
    method: "DELETE",
    url: `lists/${listId}`,
  });
}
