export const AUTH_STORE_STORAGE_KEY = "normas_auth_store";

const USER_SESSION_LOCAL_STORAGE_KEYS = [
  AUTH_STORE_STORAGE_KEY,
  "earlyn.auth.kyc.id",
  "earlyn.auth.kyc.step",
  "earlyn.dashboard.createdLists",
  "earlyn.dashboard.profile",
];

const USER_SESSION_INDEXED_DB_NAMES = [
  "earlyn-created-lists",
  "earlyn-profile-files",
];

export type StoredAuthUser = {
  email?: string;
  id?: string;
  name?: string;
  role?: string;
};

type StoredAuthState = {
  version?: number;
  state?: {
    isAuthenticated?: boolean;
    refreshToken?: string | null;
    token?: string | null;
    user?: StoredAuthUser | null;
  };
};

export function getStoredAuthState() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedAuth = window.localStorage.getItem(AUTH_STORE_STORAGE_KEY);

  if (!storedAuth) {
    return null;
  }

  try {
    return JSON.parse(storedAuth) as StoredAuthState;
  } catch {
    return null;
  }
}

export function getStoredAccessToken() {
  return getStoredAuthState()?.state?.token ?? null;
}

export function getStoredRefreshToken() {
  return getStoredAuthState()?.state?.refreshToken ?? null;
}

export function updateStoredAuthTokens({
  refreshToken,
  token,
}: {
  refreshToken?: string | null;
  token?: string | null;
}) {
  if (typeof window === "undefined") {
    return;
  }

  const storedAuth = getStoredAuthState();
  const state = storedAuth?.state ?? {};
  const nextState = {
    ...state,
    isAuthenticated: Boolean(token ?? state.token),
    refreshToken: refreshToken === undefined ? state.refreshToken ?? null : refreshToken,
    token: token === undefined ? state.token ?? null : token,
  };

  window.localStorage.setItem(
    AUTH_STORE_STORAGE_KEY,
    JSON.stringify({
      ...storedAuth,
      state: nextState,
    }),
  );
}

export function clearStoredAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORE_STORAGE_KEY);
}

function deleteIndexedDb(name: string) {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const request = window.indexedDB.deleteDatabase(name);

    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
}

export async function clearStoredUserSession() {
  if (typeof window === "undefined") {
    return;
  }

  for (const key of USER_SESSION_LOCAL_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }

  await Promise.all(USER_SESSION_INDEXED_DB_NAMES.map(deleteIndexedDb));
}
