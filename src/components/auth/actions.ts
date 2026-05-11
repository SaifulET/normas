"use server";

import { redirect } from "next/navigation";
import { setAuthenticatedSession } from "@/lib/auth";
import { signupUser } from "@/lib/auth-api";

function getRequiredFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required`);
  }

  return value.trim();
}

export async function submitLogin() {
  await setAuthenticatedSession();
  redirect("/dashboard");
}

export async function setLoginSession() {
  await setAuthenticatedSession();
}

export async function submitSignup(formData: FormData) {
  const role = formData.get("role") === "investor" ? "investor" : "investee";

  await signupUser({
    email: getRequiredFormString(formData, "email"),
    name: getRequiredFormString(formData, "name"),
    password: getRequiredFormString(formData, "password"),
    role,
  });

  await setAuthenticatedSession();
  redirect(`/kyc-verification?role=${role === "investee" ? "investee" : "investor"}`);
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
