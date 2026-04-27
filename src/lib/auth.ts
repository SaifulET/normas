import { refresh } from "next/cache";
import { cookies } from "next/headers";

const SESSION_COOKIE = "earlyn_session";
const SESSION_VALUE = "authenticated";

export async function setAuthenticatedSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAuthenticatedSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export async function login() {
  "use server";

  await setAuthenticatedSession();
  refresh();
}

export async function logout() {
  "use server";

  await clearAuthenticatedSession();
  refresh();
}
