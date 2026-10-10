"use server";

import { redirect } from "next/navigation";
import { clearAuthenticatedSession } from "@/lib/auth";
import { setSuperadminSession } from "@/lib/superadmin-auth";

function getRequiredFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required`);
  }

  return value.trim();
}

export async function submitSuperadminLogin() {
  await clearAuthenticatedSession();
  await setSuperadminSession();
  redirect("/superadmin/dashboard/user-management");
}

export async function setSuperadminLoginSession() {
  await clearAuthenticatedSession();
  await setSuperadminSession();
}

export async function submitSuperadminSignup(formData: FormData) {
  getRequiredFormString(formData, "email");
  getRequiredFormString(formData, "name");
  getRequiredFormString(formData, "password");
  throw new Error("Superadmin signup requires verification through the signup page.");
}
