import { redirect } from "next/navigation";
import { SuperadminLoginPage } from "@/components/superadmin/auth-pages";
import { isSuperadminAuthenticated } from "@/lib/superadmin-auth";

export default async function Page() {
  const authenticated = await isSuperadminAuthenticated();

  if (authenticated) {
    redirect("/superadmin/dashboard/user-management");
  }

  return <SuperadminLoginPage />;
}
