import { apiRequest, type ApiSuccessResponse } from "./api";

export type BlogImage = {
  key: string;
  url: string;
};

export type BlogStatus = "draft" | "published";

export type Blog = {
  _id: string;
  coverImage?: BlogImage | null;
  createdAt?: string;
  createdBy?: {
    _id?: string;
    email?: string;
    name?: string;
    role?: string;
  } | string | null;
  description: string;
  publishedAt?: string | null;
  slug: string;
  status: BlogStatus;
  title: string;
  updatedAt?: string;
};

export type BlogListData = {
  blogs?: Blog[];
  pagination?: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
};

export function getBlogs(params: { limit?: number; page?: number } = {}) {
  return apiRequest<ApiSuccessResponse<BlogListData>>({
    method: "GET",
    params,
    url: "blogs",
  });
}

export function getBlog(slug: string) {
  return apiRequest<ApiSuccessResponse<Blog>>({
    method: "GET",
    url: `blogs/${slug}`,
  });
}

export function getSuperadminBlogs(params: { limit?: number; page?: number; status?: BlogStatus } = {}) {
  return apiRequest<ApiSuccessResponse<BlogListData>>({
    method: "GET",
    params,
    url: "super-admin/blogs",
  });
}

export function createSuperadminBlog(payload: {
  coverImage?: File | null;
  description: string;
  status: BlogStatus;
  title: string;
}) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("status", payload.status);

  if (payload.coverImage) {
    formData.append("coverImage", payload.coverImage);
  }

  return apiRequest<ApiSuccessResponse<Blog>>({
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
    method: "POST",
    url: "super-admin/blogs",
  });
}

export function updateSuperadminBlog(blogId: string, payload: {
  coverImage?: File | null;
  description: string;
  removeCoverImage?: boolean;
  status: BlogStatus;
  title: string;
}) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("status", payload.status);

  if (payload.removeCoverImage) {
    formData.append("removeCoverImage", "true");
  }

  if (payload.coverImage) {
    formData.append("coverImage", payload.coverImage);
  }

  return apiRequest<ApiSuccessResponse<Blog>>({
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
    method: "PATCH",
    url: `super-admin/blogs/${blogId}`,
  });
}

export function uploadBlogEditorImage(image: File) {
  const formData = new FormData();
  formData.append("image", image);

  return apiRequest<ApiSuccessResponse<BlogImage>>({
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
    method: "POST",
    url: "super-admin/blogs/images",
  });
}

export function deleteBlogEditorImage(key: string) {
  return apiRequest<ApiSuccessResponse<{ key: string }>>({
    data: { key },
    method: "DELETE",
    url: "super-admin/blogs/images",
  });
}

export function deleteSuperadminBlog(blogId: string) {
  return apiRequest<ApiSuccessResponse<{ id: string }>>({
    method: "DELETE",
    url: `super-admin/blogs/${blogId}`,
  });
}
