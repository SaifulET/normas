import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

export function DashboardPageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#1E2746] md:text-[2.2rem]">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3 self-start">
        {children}
        <NotificationDropdown />
      </div>
    </div>
  );
}
