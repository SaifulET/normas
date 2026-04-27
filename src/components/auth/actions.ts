"use server";

import { redirect } from "next/navigation";
import { setAuthenticatedSession } from "@/lib/auth";

export async function submitLogin() {
  await setAuthenticatedSession();
  redirect("/dashboard");
}

export async function submitSignup(formData: FormData) {
  await setAuthenticatedSession();

  const role = formData.get("role");
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
