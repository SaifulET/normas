"use server";

import { redirect } from "next/navigation";
import { signupUser } from "@/lib/auth-api";
import { setSuperadminSession } from "@/lib/superadmin-auth";

function getRequiredFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required`);
  }

  return value.trim();
}

export async function submitSuperadminLogin() {
  await setSuperadminSession();
  redirect("/superadmin/dashboard/user-management");
}

export async function setSuperadminLoginSession() {
  await setSuperadminSession();
}

export async function submitSuperadminSignup(formData: FormData) {
  await signupUser({
    email: getRequiredFormString(formData, "email"),
    name: getRequiredFormString(formData, "name"),
    password: getRequiredFormString(formData, "password"),
    role: "superadmin",
  });

  await setSuperadminSession();
  redirect("/superadmin/dashboard/user-management");
}
