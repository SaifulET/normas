"use server";

import { redirect } from "next/navigation";
import { setAuthenticatedSession } from "@/lib/auth";
import { clearSuperadminSession } from "@/lib/superadmin-auth";

export async function submitLogin() {
  await clearSuperadminSession();
  await setAuthenticatedSession();
  redirect("/dashboard");
}

export async function setLoginSession() {
  await clearSuperadminSession();
  await setAuthenticatedSession();
}

export async function submitForgotPassword() {
  redirect("/verify-otp");
}

export async function submitVerifyOtp() {
  redirect("/reset-password");
}

export async function submitResetPassword() {
  redirect("/login");
}
