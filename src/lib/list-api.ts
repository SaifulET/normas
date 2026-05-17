import { apiRequest } from "./api";

export type ListMutationResponse = {
  data?: unknown;
  message?: string;
  success?: boolean;
};

export type ListStatus = "activated" | "deactivated";

export type ListStatusResponse = {
  data?: {
    status?: ListStatus | string;
  };
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
  keyword?: string;
  sector?: string;
  stage?: string;
  status?: ListStatus | "suspended" | string;
  title?: string;
  updatedAt?: string;
  user?: ListUser;
  viewCount?: number;
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
  return apiRequest<ListMutationResponse>({
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    method: "POST",
    url: "lists",
  });
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

export function getListSectors() {
  return apiRequest<ListSectorsResponse>({
    method: "GET",
    url: "lists/sectors",
  });
}

export function updateListStatus(listId: string, status: ListStatus) {
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
