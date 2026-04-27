import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isAuthenticated } from "@/lib/auth";

export default async function InvesteeDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
