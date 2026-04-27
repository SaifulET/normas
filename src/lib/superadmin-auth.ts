import { refresh } from "next/cache";
import { cookies } from "next/headers";

const SUPERADMIN_SESSION_COOKIE = "earlyn_superadmin_session";
const SUPERADMIN_SESSION_VALUE = "authenticated";

export async function setSuperadminSession() {
  const cookieStore = await cookies();
  cookieStore.set(SUPERADMIN_SESSION_COOKIE, SUPERADMIN_SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSuperadminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SUPERADMIN_SESSION_COOKIE);
}

export async function isSuperadminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(SUPERADMIN_SESSION_COOKIE)?.value === SUPERADMIN_SESSION_VALUE;
}

export async function loginSuperadmin() {
  "use server";

  await setSuperadminSession();
  refresh();
}

export async function logoutSuperadmin() {
  "use server";

  await clearSuperadminSession();
  refresh();
}
