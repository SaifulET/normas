"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import {
  getCachedSuperadminProfile,
  getSuperadminProfile,
  SUPERADMIN_DISPLAY_EMAILS,
  type SuperadminProfile,
} from "@/lib/superadmin-profile-api";
import { superadminNavItems, type SuperadminNavIcon } from "./data";
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
    case "lists":
      return (
        <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M7 4.75h10A2.25 2.25 0 0 1 19.25 7v10A2.25 2.25 0 0 1 17 19.25H7A2.25 2.25 0 0 1 4.75 17V7A2.25 2.25 0 0 1 7 4.75Z" />
          <path d="M8.5 9h7" />
          <path d="M8.5 12h7" />
          <path d="M8.5 15h4.5" />
        </svg>
      );
    case "payment":
      return (
       <HugeiconsIcon icon={CreditCardPosIcon} className="w-[24px] h-[24px]" />
      );
    case "messages":
      return (
       <HugeiconsIcon icon={ChatIcon} className="w-[24px] h-[24px]" />
      );
    case "moderation":
      return (
       <HugeiconsIcon icon={Flag02Icon} className="w-[24px] h-[24px]" />
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

function getInitials(name?: string, fallback = "") {
  return name
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || fallback;
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<SuperadminProfile | null>(null);
  const [sidebarScrollIndicator, setSidebarScrollIndicator] = useState({
    hasOverflow: false,
    thumbHeight: 0,
    thumbTop: 0,
    visible: false,
  });
  const sidebarScrollAreaRef = useRef<HTMLDivElement | null>(null);
  const sidebarScrollTimeoutRef = useRef<number | null>(null);

  const sidebarWidth = collapsed ? "w-[88px]" : "w-[300px]";
  const contentPadding = collapsed ? "lg:pl-[88px]" : "lg:pl-[300px]";
  const sidebarName = profile?.name?.trim() || "";
  const sidebarImage = profile?.profileImage?.trim() || "";
  const profileHref = "/superadmin/dashboard/settings";
  const profileActive = isActivePath(pathname, profileHref);
  const hasSidebarProfile = Boolean(sidebarName || sidebarImage || SUPERADMIN_DISPLAY_EMAILS.length);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const cachedProfile = getCachedSuperadminProfile();

      if (active && cachedProfile) {
        setProfile(cachedProfile);
      }

      try {
        const response = await getSuperadminProfile();

        if (active) {
          setProfile(response.data ?? null);
        }
      } catch {
        if (active) {
          setProfile(null);
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (sidebarScrollTimeoutRef.current) {
        window.clearTimeout(sidebarScrollTimeoutRef.current);
      }
    };
  }, []);

  const updateSidebarScrollIndicator = (visible: boolean) => {
    const scrollArea = sidebarScrollAreaRef.current;

    if (!scrollArea) {
      return;
    }

    const { clientHeight, scrollHeight, scrollTop } = scrollArea;
    const maxScrollTop = scrollHeight - clientHeight;

    if (maxScrollTop <= 0) {
      setSidebarScrollIndicator({ hasOverflow: false, thumbHeight: 0, thumbTop: 0, visible: false });
      return;
    }

    const thumbHeight = Math.max(36, (clientHeight / scrollHeight) * clientHeight);
    const thumbTop = (scrollTop / maxScrollTop) * (clientHeight - thumbHeight);

    setSidebarScrollIndicator({
      hasOverflow: true,
      thumbHeight,
      thumbTop,
      visible,
    });
  };

  useEffect(() => {
    updateSidebarScrollIndicator(false);

    const scrollArea = sidebarScrollAreaRef.current;

    if (!scrollArea || typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(() => updateSidebarScrollIndicator(false));
    resizeObserver.observe(scrollArea);

    return () => {
      resizeObserver.disconnect();
    };
  }, [collapsed, pathname]);

  const handleSidebarScroll = () => {
    updateSidebarScrollIndicator(true);

    if (sidebarScrollTimeoutRef.current) {
      window.clearTimeout(sidebarScrollTimeoutRef.current);
    }

    sidebarScrollTimeoutRef.current = window.setTimeout(() => {
      setSidebarScrollIndicator((current) => ({ ...current, visible: false }));
      sidebarScrollTimeoutRef.current = null;
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F7] text-[#212443]">
      <aside className={cx("fixed inset-y-0 left-0 z-30 hidden lg:flex min-h-0 flex-col overflow-hidden border-r border-[#D4D7E2] bg-[#2B425D] text-white transition-all duration-200", sidebarWidth)}>
        <div className="relative shrink-0">
          <SidebarLogo collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        </div>

        <div className="relative min-h-0 flex-1">
          <div
            ref={sidebarScrollAreaRef}
            className={cx("superadmin-sidebar-scroll h-full space-y-5 overflow-y-auto overscroll-contain py-5", collapsed ? "px-2" : "px-2.5")}
            onScroll={handleSidebarScroll}
          >
            <SidebarSection collapsed={collapsed} pathname={pathname} section="main" />
            <SidebarSection collapsed={collapsed} pathname={pathname} section="core" />
          </div>

          {sidebarScrollIndicator.hasOverflow ? (
            <div
              aria-hidden="true"
              className={cx(
                "pointer-events-none absolute inset-y-0 right-0 w-2 bg-[#2B425D] transition-opacity duration-150",
                sidebarScrollIndicator.visible ? "opacity-100" : "opacity-0",
              )}
            >
              <span
                className="absolute right-1 top-0 w-1 rounded-full bg-white/45"
                style={{
                  height: sidebarScrollIndicator.thumbHeight,
                  transform: `translateY(${sidebarScrollIndicator.thumbTop}px)`,
                }}
              />
            </div>
          ) : null}
        </div>

        <div className={cx("shrink-0 border-t border-white/8 py-4", collapsed ? "px-2" : "px-3")}>
          <Link
            href={profileHref}
            className={cx(
              "flex w-full rounded-[10px] text-left transition hover:bg-white/8 focus:outline-none focus:ring-2 focus:ring-white/35",
              collapsed ? "justify-center px-2 py-2" : "items-center gap-3 px-2 py-2",
              profileActive ? "bg-white/10" : "",
            )}
            title={collapsed ? "Profile" : undefined}
          >
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/14 text-xs font-semibold text-white">
              {sidebarImage ? (
                <img src={sidebarImage} alt={`${sidebarName} profile`} className="h-full w-full object-cover" />
              ) : sidebarName ? (
                getInitials(sidebarName)
              ) : (
                <span className="h-3.5 w-3.5 rounded-full bg-white/30" aria-hidden="true" />
              )}
            </span>
            {!collapsed ? (
              <>
                <div className="min-w-0 flex-1">
                  {hasSidebarProfile ? (
                    <>
                      <p className="truncate text-sm font-medium text-white">{sidebarName || "Super Admin"}</p>
                      <span className="mt-1 block space-y-0.5">
                        {SUPERADMIN_DISPLAY_EMAILS.map((email) => (
                          <p key={email} className="truncate text-[11px] text-white/42">{email}</p>
                        ))}
                      </span>
                    </>
                  ) : (
                    <span className="block space-y-1.5" aria-label="Loading profile">
                      <span className="block h-3 w-20 rounded-full bg-white/14" />
                      <span className="block h-2.5 w-28 rounded-full bg-white/10" />
                    </span>
                  )}
                </div>
                <SuperadminIcon name="chevronDown" className="h-4 w-4 text-white/55" />
              </>
            ) : null}
          </Link>

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

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-[#0F172A]/35 lg:hidden" onClick={() => setMobileOpen(false)}>
          <aside
            className="flex h-full w-[288px] flex-col overflow-hidden bg-[#2B425D] text-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative shrink-0 border-b border-white/8 px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
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
                <div>
                  <p className="text-[1.08rem] font-semibold text-white">Early-N</p>
                  <p className="text-xs text-white/65">Super Admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-white/10 bg-white/6 text-white/70 hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="relative min-h-0 flex-1 px-2.5 py-5 overflow-y-auto superadmin-sidebar-scroll space-y-5">
              <SidebarSection collapsed={false} pathname={pathname} section="main" />
              <SidebarSection collapsed={false} pathname={pathname} section="core" />
            </div>

            <div className="shrink-0 border-t border-white/8 px-3 py-4">
              <Link
                href={profileHref}
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center gap-3 rounded-[10px] px-2 py-2 text-left hover:bg-white/8"
              >
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/14 text-xs font-semibold text-white">
                  {sidebarImage ? (
                    <img src={sidebarImage} alt="profile" className="h-full w-full object-cover" />
                  ) : (
                    getInitials(sidebarName) || "A"
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{sidebarName || "Super Admin"}</p>
                  <span className="mt-1 block space-y-0.5">
                    {SUPERADMIN_DISPLAY_EMAILS.map((email) => (
                      <p key={email} className="truncate text-[11px] text-white/42">{email}</p>
                    ))}
                  </span>
                </div>
              </Link>
              <LogoutButton
                redirectHref="/superadmin/auth/login"
                className="mt-3 flex w-full items-center gap-3 rounded-[10px] px-4 py-3 text-[13px] font-medium text-white/70 hover:bg-white/8 hover:text-white"
              >
                <SuperadminIcon name="logout" className="h-4 w-4 shrink-0" />
                <span>Logout</span>
              </LogoutButton>
            </div>
          </aside>
        </div>
      ) : null}

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#D4D7E2] bg-white px-4 py-4 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#DEE6F1] bg-white text-[#2B425D]"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="relative h-[28px] w-[62px] shrink-0 overflow-hidden">
            <Image
              src="/logo.svg"
              alt="EARLY-N"
              fill
              priority
              sizes="62px"
              className="object-left object-contain"
            />
          </div>
        </div>
      </header>

      <div className="fixed right-4 top-4 z-40 sm:right-6 sm:top-6">
        <NotificationDropdown variant="superadmin" />
      </div>

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
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-semibold tracking-[-0.04em] text-[#202350]">{title}</h1>
        <p className="mt-1 text-[13px] text-[#69729A]">{subtitle}</p>
      </div>

      {actionArea ? <div className="flex items-center gap-3">{actionArea}</div> : null}
    </div>
  );
}

export function SuperadminNotificationButton() {
  return null;
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
