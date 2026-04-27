import Image from "next/image";

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
        <button
          type="button"
          className="relative inline-flex items-center justify-center rounded-[8px] border border-[#E5EAF2] bg-white p-[13px] text-[#314B6B] shadow-[0_14px_35px_-28px_rgba(36,59,90,0.55)]"
          aria-label="Notifications"
        >
          <Image src="/notification-01.svg" alt="" width={20} height={20} aria-hidden="true" />
          <span className="absolute right-[9px] top-[9px] h-[6px] w-[6px] rounded-full bg-[#EF4444]" />
        </button>
      </div>
    </div>
  );
}
