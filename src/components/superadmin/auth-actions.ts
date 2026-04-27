"use server";

import { redirect } from "next/navigation";
import { setSuperadminSession } from "@/lib/superadmin-auth";

export async function submitSuperadminLogin() {
  await setSuperadminSession();
  redirect("/superadmin/dashboard/user-management");
}

export async function submitSuperadminSignup() {
  await setSuperadminSession();
  redirect("/superadmin/dashboard/user-management");
}
