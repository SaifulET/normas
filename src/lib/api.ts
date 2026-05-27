import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredRefreshToken,
  updateStoredAuthTokens,
} from "./auth-storage";

export const API_BASE_URL =
  // process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://normas-backend.vercel.app/api/v1/";
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1/";

type RefreshTokenResponse = ApiSuccessResponse<{
  accessToken?: string;
  refreshToken?: string;
  token?: string;
}>;

type RetryableAxiosRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

function isAuthEndpoint(url?: string) {
  return Boolean(url?.includes("auth/signin") || url?.includes("auth/signup") || url?.includes("auth/refresh-token"));
}

function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  const loginPath = window.location.pathname.startsWith("/superadmin") ? "/superadmin/auth/login" : "/login";
  window.location.assign(loginPath);
}

async function clearAppSession() {
  if (typeof window === "undefined") {
    return;
  }

  await fetch("/api/auth/logout", {
    method: "POST",
  });
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();

  if (token && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;

    if (!originalRequest || originalRequest._retry || error.response?.status !== 401 || isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    const refreshToken = getStoredRefreshToken();

    if (!refreshToken) {
      clearStoredAuth();
      await clearAppSession();
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await axios.post<RefreshTokenResponse>(
        "auth/refresh-token",
        { refreshToken },
        {
          baseURL: API_BASE_URL,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      const nextAccessToken = response.data.data.accessToken ?? response.data.data.token;
      const nextRefreshToken = response.data.data.refreshToken ?? refreshToken;

      if (!response.data.success || !nextAccessToken) {
        clearStoredAuth();
        await clearAppSession();
        redirectToLogin();
        return Promise.reject(error);
      }

      updateStoredAuthTokens({
        refreshToken: nextRefreshToken,
        token: nextAccessToken,
      });

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${nextAccessToken}`,
      };

      return api(originalRequest);
    } catch (refreshError) {
      clearStoredAuth();
      await clearAppSession();
      redirectToLogin();

      return Promise.reject(refreshError);
    }
  },
);

export type ApiSuccessResponse<T> = {
  data: T;
  message?: string;
  success?: boolean;
};

export type ApiErrorResponse = {
  errors?: Record<string, string[] | string>;
  message?: string;
  success?: boolean;
};

export async function apiRequest<T>(config: AxiosRequestConfig) {
  const response = await api.request<T>(config);
  return response.data;
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function isApiError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return axios.isAxiosError<ApiErrorResponse>(error);
}
