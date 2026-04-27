"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  dashboardNavItems,
  dashboardProfileLinks,
  dashboardUser,
  investeeDashboardNavItems,
  investeeDashboardProfileLinks,
  investeeDashboardUser,
  type DashboardNavItem,
} from "./data";
import { DashboardIcon } from "./icons";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function SidebarLogoMark({ light = false }: { light?: boolean }) {
  return (
    <div className="flex h-[28px] w-[62px] items-center justify-start overflow-hidden">
      <div className="relative h-[28px] w-[62px] shrink-0">
        <Image
          src={light ? "/logo.svg" : "/footer-logo.svg"}
          alt="EARLY-N"
          fill
          className="object-left object-contain"
          priority
          sizes="69px"
        />
      </div>
    </div>
  );
}

function SidebarBrand({ light = false, role }: { light?: boolean; role: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <SidebarLogoMark light={light} />
      <div className="min-w-0">
        <p className={cx("truncate text-[1.08rem] font-semibold", light ? "text-[#1E2746]" : "text-white")}>
          Early-N
        </p>
        <p className={cx("truncate text-xs", light ? "text-[#6B7280]" : "text-white/65")}>
          {role}
        </p>
      </div>
    </div>
  );
}

function isActivePath(pathname: string, item: DashboardNavItem) {
  if (item.href === "/") {
    return pathname === "/";
  }

  if (item.href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function isProfileSection(pathname: string) {
  return (
    pathname.startsWith("/dashboard/profile") ||
    pathname.startsWith("/dashboard/settings") ||
    pathname.startsWith("/investee-dashboard/profile") ||
    pathname.startsWith("/investee-dashboard/settings")
  );
}

function SidebarContent({
  collapsed,
  homeHref,
  navItems,
  pathname,
  onCollapseToggle,
  onNavigate,
  profileLinks,
  profileOpen,
  onProfileToggle,
  user,
}: {
  collapsed: boolean;
  homeHref: string;
  navItems: DashboardNavItem[];
  pathname: string;
  onCollapseToggle: () => void;
  onNavigate: () => void;
  profileLinks: typeof dashboardProfileLinks;
  profileOpen: boolean;
  onProfileToggle: () => void;
  user: typeof dashboardUser;
}) {
  return (
    <>
      {collapsed ? (
        <div className="flex justify-center px-3 py-5">
          <button
            type="button"
            onClick={onCollapseToggle}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
            aria-label="Expand sidebar"
          >
            <DashboardIcon name="expand" className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-5">
          <Link
            href={homeHref}
            className="flex min-w-0 items-center rounded-2xl px-1.5 py-1.5 transition hover:bg-white/5"
            onClick={onNavigate}
          >
            <SidebarBrand role={user.role} />
          </Link>

          <button
            type="button"
            onClick={onCollapseToggle}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
            aria-label="Collapse sidebar"
          >
            <DashboardIcon name="collapse" className="h-5 w-5" />
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cx(
                "group flex items-center rounded-2xl text-sm font-medium transition",
                collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3",
                active
                  ? "bg-white/18 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-white/72 hover:bg-white/8 hover:text-white",
              )}
              title={collapsed ? item.label : undefined}
            >
              <DashboardIcon name={item.icon} className="h-5 w-5 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onProfileToggle}
          className={cx(
            "flex w-full items-center rounded-2xl text-left transition hover:bg-white/8",
            collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-3",
            isProfileSection(pathname) ? "bg-white/12 text-white" : "text-white/80",
          )}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#243B5A]">
            {user.initials}
          </div>
          {!collapsed ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                <p className="truncate text-xs text-white/55">{user.email}</p>
              </div>
              <DashboardIcon
                name="chevronDown"
                className={cx("h-4 w-4 transition", profileOpen ? "rotate-180" : "")}
              />
            </>
          ) : null}
        </button>

        {!collapsed && profileOpen ? (
          <div className="mt-2 space-y-1 pl-[3.5rem]">
            {profileLinks.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cx(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                    active ? "bg-white/14 text-white" : "text-white/65 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <DashboardIcon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const sidebarProfileOpen = isProfileSection(pathname) || profileOpen;
  const desktopSidebarWidth = collapsed ? "lg:pl-[96px]" : "lg:pl-[276px]";
  const investeeDashboard = pathname.startsWith("/investee-dashboard");
  const sidebarUser = investeeDashboard ? investeeDashboardUser : dashboardUser;
  const sidebarNavItems = investeeDashboard ? investeeDashboardNavItems : dashboardNavItems;
  const sidebarProfileLinks = investeeDashboard ? investeeDashboardProfileLinks : dashboardProfileLinks;
  const dashboardHomeHref = investeeDashboard ? "/investee-dashboard" : "/dashboard";

  return (
    <div className="min-h-screen bg-white text-[#1E2746]">
      <div className="min-h-screen">
        <aside
          className={cx(
            "fixed inset-y-0 left-0 z-30 hidden flex-col bg-[#243B5A] text-white lg:flex",
            collapsed ? "w-[96px]" : "w-[276px]",
          )}
        >
          <SidebarContent
            collapsed={collapsed}
            homeHref={dashboardHomeHref}
            navItems={sidebarNavItems}
            pathname={pathname}
            onCollapseToggle={() => setCollapsed((value) => !value)}
            onNavigate={() => undefined}
            profileLinks={sidebarProfileLinks}
            profileOpen={sidebarProfileOpen}
            onProfileToggle={() => {
              if (collapsed) {
                setCollapsed(false);
                setProfileOpen(true);
                return;
              }

              setProfileOpen((value) => !value);
            }}
            user={sidebarUser}
          />
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 bg-[#0F172A]/35 lg:hidden" onClick={() => setMobileOpen(false)}>
            <aside
              className="flex h-full w-[288px] flex-col bg-[#243B5A] text-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <SidebarContent
                collapsed={false}
                homeHref={dashboardHomeHref}
                navItems={sidebarNavItems}
                pathname={pathname}
                onCollapseToggle={() => setMobileOpen(false)}
                onNavigate={() => setMobileOpen(false)}
                profileLinks={sidebarProfileLinks}
                profileOpen={sidebarProfileOpen}
                onProfileToggle={() => setProfileOpen((value) => !value)}
                user={sidebarUser}
              />
            </aside>
          </div>
        ) : null}

        <div className={cx("min-w-0", desktopSidebarWidth)}>
          <header className="sticky top-0 z-20 border-b border-[#E7ECF3]/80 bg-[#F4F6FB]/90 px-4 py-4 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DEE6F1] bg-white text-[#243B5A]"
                aria-label="Open dashboard menu"
              >
                <DashboardIcon name="dashboard" className="h-5 w-5" />
              </button>

              <Link href={dashboardHomeHref} className="flex items-center">
                <SidebarBrand light role={sidebarUser.role} />
              </Link>

              <Link
                href="/"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DEE6F1] bg-white text-[#243B5A]"
                aria-label="Open website"
              >
                <DashboardIcon name="external" className="h-5 w-5" />
              </Link>
            </div>
          </header>

          <main className="min-w-0 p-4 sm:p-6 xl:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
