"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { superadminNavItems, superadminUser, type SuperadminNavIcon } from "./data";
import { HugeiconsIcon } from "@hugeicons/react";
import { Analytics01Icon, ArrowLeft02Icon, Calendar03Icon, ChatIcon, CreditCardPosIcon, DashboardSquare01Icon, Flag02Icon, HeadsetIcon, Logout03Icon, Notification01Icon, Settings01Icon, SidebarRightIcon, User02Icon } from "@hugeicons/core-free-icons";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function SuperadminIcon({
  name,
  className,
}: {
  name: SuperadminNavIcon | "back" | "bell" | "collapse" | "dots" | "logo" | "search" | "chevronDown" | "document" | "logout";
  className?: string;
}) {
  const classes = className ?? "h-4 w-4";

  switch (name) {
    case "analytics":
      return (
        <HugeiconsIcon icon={Analytics01Icon} className="w-[24px] h-[24px]" />
      );
    case "dashboard":
      return (
        <HugeiconsIcon icon={DashboardSquare01Icon} className="w-[24px] h-[24px]"/>
      );
    case "payment":
      return (
       <HugeiconsIcon icon={CreditCardPosIcon} className="w-[24px] h-[24px]" />
      );
    case "messages":
      return (
       <HugeiconsIcon icon={ChatIcon} className="w-[24px] h-[24px]" />
      );
    case "reports":
      return (
       <HugeiconsIcon icon={Flag02Icon} className="w-[24px] h-[24px]" />
      );
    case "schedule":
      return (
       <HugeiconsIcon icon={Calendar03Icon} className="w-[24px] h-[24px]" />
      );
    case "settings":
      return (
        <HugeiconsIcon icon={Settings01Icon} className="w-[24px] h-[24px]" />
      );
    case "support":
      return (
       <HugeiconsIcon icon={HeadsetIcon} className="w-[24px] h-[24px]" />
      );
    case "users":
      return (
     <HugeiconsIcon icon={User02Icon} className="w-[24px] h-[24px]" />
      );
    case "back":
      return (
        <HugeiconsIcon icon={ArrowLeft02Icon} className="w-[24px] h-[24px]"/>
      );
    case "bell":
      return (
       <HugeiconsIcon icon={Notification01Icon} className="w-[20px] h-[20px]" />
      );
    case "collapse":
      return (
        <HugeiconsIcon icon={SidebarRightIcon} />
      );
    case "chevronDown":
      return (
        <svg viewBox="0 0 24 24" className={classes} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="m7 10 5 5 5-5" />
        </svg>
      );
    case "document":
      return (
        <svg viewBox="0 0 24 24" className={classes} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <path d="M8 4.75h5.5L18.25 9.5V18a2 2 0 0 1-2 2H8A2 2 0 0 1 6 18V6.75a2 2 0 0 1 2-2Z" />
          <path d="M13.5 4.75V9.5h4.75" />
          <path d="M9.5 13h5" />
          <path d="M9.5 16h3.5" />
        </svg>
      );
    case "logout":
      return (
        <HugeiconsIcon icon={Logout03Icon} className={className ?? "h-4 w-4"} />
      );
    case "dots":
      return (
        <svg viewBox="0 0 24 24" className={classes} fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="6.5" r="1.4" />
          <circle cx="12" cy="12" r="1.4" />
          <circle cx="12" cy="17.5" r="1.4" />
        </svg>
      );
    case "logo":
      return (
        <svg viewBox="0 0 28 28" className={classes} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="4" y="4" width="8" height="8" rx="2" />
          <rect x="16" y="4" width="8" height="8" rx="2" />
          <rect x="4" y="16" width="8" height="8" rx="2" />
          <rect x="16" y="16" width="8" height="8" rx="2" />
        </svg>
      );
    case "search":
      return (
        <svg viewBox="0 0 24 24" className={classes} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4.5 4.5" />
        </svg>
      );
    default:
      return null;
  }
}

function isActivePath(pathname: string, href: string) {
  if (href === "/superadmin/dashboard" || href === "/superadmin/dashboard/analytics") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLogo({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={cx("border-b border-white/8 py-4", collapsed ? "flex flex-col items-center gap-3 px-2" : "flex items-center gap-2.5 px-3")}>
      {!collapsed ? (
        <>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative h-[28px] w-[62px] shrink-0 overflow-hidden">
              <Image
                src="/footer-logo.svg"
                alt="EARLY-N"
                fill
                priority
                sizes="62px"
                className="object-left object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[1.08rem] font-semibold text-white">Early-N</p>
              <p className="truncate text-xs text-white/65">Super Admin</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-white/10 bg-white/6 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Collapse sidebar"
          >
            <SuperadminIcon name="collapse" className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <div className="relative h-[28px] w-[34px] shrink-0 overflow-hidden">
            <Image
              src="/footer-logo.svg"
              alt="EARLY-N"
              fill
              priority
              sizes="34px"
              className="object-left object-contain"
            />
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-white/10 bg-white/6 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Expand sidebar"
          >
            <SuperadminIcon name="collapse" className="h-4 w-4 rotate-180" />
          </button>
        </>
      )}
    </div>
  );
}

function SidebarSection({
  collapsed,
  pathname,
  section,
}: {
  collapsed: boolean;
  pathname: string;
  section: "main" | "core";
}) {
  const items = superadminNavItems.filter((item) => item.section === section);

  return (
    <div className="space-y-1">
      {!collapsed ? <p className="px-4 pb-2 text-[10px] uppercase tracking-[0.18em] text-white/30">{section}</p> : null}
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cx(
              "flex rounded-[10px] text-[13px] transition",
              collapsed ? "justify-center px-2 py-3" : "items-center gap-3 px-4 py-3",
              active ? "bg-[#D8D0E2] text-[#1F233D]" : "text-white/72 hover:bg-white/8 hover:text-white",
            )}
            title={collapsed ? item.label : undefined}
          >
            <SuperadminIcon name={item.icon} className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>{item.label}</span> : null}
          </Link>
        );
      })}
    </div>
  );
}

export function SuperadminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? "w-[88px]" : "w-[300px]";
  const contentPadding = collapsed ? "pl-[88px]" : "pl-[300px]";

  return (
    <div className="min-h-screen bg-[#F4F4F7] text-[#212443]">
      <aside className={cx("fixed inset-y-0 left-0 z-30 flex flex-col border-r border-[#D4D7E2] bg-[#2B425D] text-white transition-all duration-200", sidebarWidth)}>
        <div className=" relative ">
          <SidebarLogo collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        </div>

        <div className={cx(" flex-1  space-y-5 py-5", collapsed ? "px-2" : "px-2.5")}>
          <SidebarSection collapsed={collapsed} pathname={pathname} section="main" />
          <SidebarSection collapsed={collapsed} pathname={pathname} section="core" />
        </div>

        <div className={cx("border-t border-white/8 py-4", collapsed ? "px-2" : "px-3")}>
          <button type="button" className={cx("flex w-full text-left", collapsed ? "justify-center" : "items-center gap-3")}>
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#111217]">
              {superadminUser.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
            {!collapsed ? (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{superadminUser.name}</p>
                  <p className="truncate text-[11px] text-white/42">{superadminUser.email}</p>
                </div>
                <SuperadminIcon name="chevronDown" className="h-4 w-4 text-white/55" />
              </>
            ) : null}
          </button>

          <LogoutButton
            redirectHref="/superadmin/auth/login"
            className={cx(
              "mt-3 flex w-full rounded-[10px] text-[13px] font-medium text-white/70 transition hover:bg-white/8 hover:text-white disabled:cursor-wait disabled:opacity-70",
              collapsed ? "justify-center px-2 py-3" : "items-center gap-3 px-4 py-3",
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <SuperadminIcon name="logout" className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>Logout</span> : null}
          </LogoutButton>
        </div>
      </aside>

      <div className={cx("transition-all duration-200", contentPadding)}>
        <main className="min-h-screen p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export function SuperadminPageHeader({
  actionArea,
  subtitle,
  title,
}: {
  actionArea?: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.04em] text-[#202350]">{title}</h1>
        <p className="mt-1 text-[13px] text-[#69729A]">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {actionArea}
        <button
          type="button"
          className="relative inline-flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#E2E4ED] bg-white text-[#4D5572]"
          aria-label="Notifications"
        >
          <SuperadminIcon name="bell" className="h-4 w-4" />
          <span className="absolute right-[5px] top-[5px] h-[4px] w-[4px] rounded-full bg-[#EF4444]" />
        </button>
      </div>
    </div>
  );
}

export function SuperadminNotificationButton() {
  return (
    <button
      type="button"
      className="relative inline-flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#E2E4ED]  text-[#4D5572]"
      aria-label="Notifications"
    >
      <SuperadminIcon name="bell" className="h-4 w-4" />
      <span className="absolute right-[5px] top-[5px] h-[4px] w-[4px] rounded-full bg-[#EF4444]" />
    </button>
  );
}

export function SuperadminSearch({
  placeholder = "Search user by name or company name",
}: {
  placeholder?: string;
}) {
  return (
    <label className="flex h-9 min-w-[246px] items-center gap-2 rounded-full border border-[#E3E6EF] bg-white px-3 text-[#8C93A8]">
      <SuperadminIcon name="search" className="h-4 w-4" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full border-0 bg-transparent text-[12px] text-[#20243A] outline-none placeholder:text-[#9AA1B6]"
      />
    </label>
  );
}

export function SuperadminFilter({
  label,
}: {
  label: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#DDE2EC] bg-white px-3 text-[12px] text-[#525B79]"
    >
      <span>{label}</span>
      <SuperadminIcon name="chevronDown" className="h-3.5 w-3.5" />
    </button>
  );
}

export function SuperadminStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalizedStatus = status.toLowerCase();
  const label = status ? `${status.charAt(0).toUpperCase()}${status.slice(1)}` : "Unknown";
  const tone =
    normalizedStatus === "active"
      ? "bg-[#D6F8E3] text-[#0F9F5D]"
      : normalizedStatus === "resolved" || normalizedStatus === "solved"
        ? "bg-[#D6F8E3] text-[#0F9F5D]"
        : normalizedStatus === "pending"
          ? "bg-[#FFE9D9] text-[#F97316]"
          : normalizedStatus === "inactive"
            ? "bg-[#FEE2E2] text-[#DC2626]"
          : "bg-[#EFF1F5] text-[#98A2B3]";

  return <span className={cx("inline-flex rounded-full px-2 py-1 text-[10px] font-medium", tone)}>{label}</span>;
}

export function SuperadminAvatar({
  from,
  initials,
  src,
  size = 42,
  to,
}: {
  from: string;
  initials: string;
  src?: string;
  size?: number;
  to: string;
}) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-cover bg-center text-white shadow-[0_10px_20px_-18px_rgba(0,0,0,0.7)]"
      style={{
        backgroundImage: src ? `url("${src}")` : `linear-gradient(135deg, ${from}, ${to})`,
        fontSize: size < 40 ? "10px" : "12px",
        fontWeight: 700,
        height: size,
        width: size,
      }}
    >
      {src ? null : initials}
    </span>
  );
}

export function SuperadminDotsButton({
  onClick,
}: {
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8D95AF] transition hover:bg-[#F5F6FA] hover:text-[#212443]"
    >
      <SuperadminIcon name="dots" className="h-4 w-4" />
    </button>
  );
}

export function SuperadminBackLink({
  href,
}: {
  href: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#7E86A3] transition hover:bg-white hover:text-[#202350]"
    >
      <SuperadminIcon name="back" className="h-4 w-4" />
    </Link>
  );
}

export function SuperadminDocumentCard({
  fileName,
}: {
  fileName: string;
}) {
  return (
    <div className="inline-flex w-[64px] flex-col items-center gap-2 rounded-[8px] border border-[#8F96AE] bg-white px-2 py-2 text-[#2C2F43]">
      <SuperadminIcon name="document" className="h-8 w-8" />
      <span className="text-[8px] text-[#6F768B]">{fileName}</span>
    </div>
  );
}
