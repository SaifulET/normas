"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AUTH_STORE_STORAGE_KEY } from "@/lib/auth-storage";

export type AuthUser = {
  email?: string;
  id?: string;
  name?: string;
  role?: string;
};

type AuthState = {
  isAuthenticated: boolean;
  refreshToken: string | null;
  token: string | null;
  user: AuthUser | null;
  clearAuth: () => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setAuth: (payload: { refreshToken?: string | null; token?: string | null; user?: AuthUser | null }) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      refreshToken: null,
      token: null,
      user: null,
      clearAuth: () =>
        set({
          isAuthenticated: false,
          refreshToken: null,
          token: null,
          user: null,
        }),
      setAuth: ({ refreshToken, token, user }) =>
        set((state) => {
          const nextRefreshToken = refreshToken === undefined ? state.refreshToken : refreshToken;
          const nextToken = token === undefined ? state.token : token;
          const nextUser = user === undefined ? state.user : user;

          return {
            isAuthenticated: Boolean(nextToken),
            refreshToken: nextRefreshToken,
            token: nextToken,
            user: nextUser,
          };
        }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setToken: (token) =>
        set((state) => ({
          isAuthenticated: Boolean(token),
          refreshToken: token ? state.refreshToken : null,
          token,
          user: token ? state.user : null,
        })),
      setUser: (user) => set({ user }),
    }),
    {
      name: AUTH_STORE_STORAGE_KEY,
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        refreshToken: state.refreshToken,
        token: state.token,
        user: state.user,
      }),
      storage: createJSONStorage(() => window.localStorage),
    },
  ),
);
