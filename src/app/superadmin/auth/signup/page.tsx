import { redirect } from "next/navigation";
import { SuperadminSignupPage } from "@/components/superadmin/auth-pages";
import { isSuperadminAuthenticated } from "@/lib/superadmin-auth";

export default async function Page() {
  const authenticated = await isSuperadminAuthenticated();

  if (authenticated) {
    redirect("/superadmin/dashboard/user-management");
  }

  return <SuperadminSignupPage />;
}
