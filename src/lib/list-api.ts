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

export function getList(listId: string) {
  return apiRequest<ListResponse>({
    method: "GET",
    url: `lists/${listId}`,
  });
}

export function updateListStatus(listId: string, status: ListStatus) {
  return apiRequest<ListStatusResponse>({
    data: { status },
    method: "PATCH",
    url: `lists/${listId}/status`,
  });
}

export function deleteList(listId: string) {
  return apiRequest<ListMutationResponse>({
    method: "DELETE",
    url: `lists/${listId}`,
  });
}
