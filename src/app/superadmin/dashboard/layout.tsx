import { redirect } from "next/navigation";
import { SuperadminShell } from "@/components/superadmin/shell";
import { isSuperadminAuthenticated } from "@/lib/superadmin-auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isSuperadminAuthenticated();

  if (!authenticated) {
    redirect("/superadmin/auth/login");
  }

  return <SuperadminShell>{children}</SuperadminShell>;
}
