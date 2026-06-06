"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { apiRequest } from "@/lib/api";
import { getStoredAuthState } from "@/lib/auth-storage";
import {
  dashboardNavItems,
  dashboardUser,
  investeeDashboardNavItems,
  investeeDashboardUser,
  type DashboardNavItem,
} from "./data";
import { DashboardIcon } from "./icons";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type AuthProfileResponse = {
  data?: {
    email?: string;
    id?: string;
    mobile?: string;
    name?: string;
    profileImage?: string;
    role?: string;
  };
  message?: string;
  success?: boolean;
};

type SidebarUser = typeof dashboardUser & {
  profileImage?: string;
};

function getInitials(name?: string, fallback = "U") {
  const initials = name
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || fallback;
}

function getRoleDashboardHref(pathname: string, role?: string) {
  const normalizedRole = role?.toLowerCase();

  if (normalizedRole === "investee" && pathname.startsWith("/dashboard")) {
    const suffix = pathname.slice("/dashboard".length);
    const allowedSuffixes = ["", "/messages", "/profile", "/schedule", "/support-center", "/upgrade-plan"];
    const canUseSuffix = allowedSuffixes.some((item) => suffix === item || suffix.startsWith(`${item}/`));

    return canUseSuffix ? `/investee-dashboard${suffix}` : "/investee-dashboard";
  }

  if (normalizedRole === "investor" && pathname.startsWith("/investee-dashboard")) {
    const suffix = pathname.slice("/investee-dashboard".length);
    const allowedSuffixes = ["", "/messages", "/profile", "/schedule", "/support-center", "/upgrade-plan"];
    const canUseSuffix = allowedSuffixes.some((item) => suffix === item || suffix.startsWith(`${item}/`));

    return canUseSuffix ? `/dashboard${suffix}` : "/dashboard";
  }

  return null;
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

  if (item.href === "/investee-dashboard") {
    return pathname === "/investee-dashboard";
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function isProfileSection(pathname: string) {
  return (
    pathname.startsWith("/dashboard/profile") ||
    pathname.startsWith("/investee-dashboard/profile")
  );
}

function SidebarContent({
  collapsed,
  homeHref,
  navItems,
  pathname,
  onCollapseToggle,
  onNavigate,
  profileHref,
  user,
}: {
  collapsed: boolean;
  homeHref: string;
  navItems: DashboardNavItem[];
  pathname: string;
  onCollapseToggle: () => void;
  onNavigate: () => void;
  profileHref: string;
  user: SidebarUser;
}) {
  const [failedProfileImage, setFailedProfileImage] = useState<string | null>(null);
  const logoutClassName = cx(
    "mt-2 flex w-full items-center rounded-2xl text-left text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white disabled:cursor-wait disabled:opacity-70",
    collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-3",
  );
  const showProfileImage = Boolean(user.profileImage) && failedProfileImage !== user.profileImage;

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
        <Link
          href={profileHref}
          onClick={onNavigate}
          className={cx(
            "flex w-full items-center rounded-2xl text-left transition hover:bg-white/8",
            collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-3",
            isProfileSection(pathname) ? "bg-white/12 text-white" : "text-white/80",
          )}
          title={collapsed ? "Profile" : undefined}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-sm font-semibold text-[#243B5A]">
            {showProfileImage ? (
              <img
                src={user.profileImage}
                alt={`${user.name} profile`}
                className="h-full w-full object-cover"
                onError={() => setFailedProfileImage(user.profileImage ?? null)}
              />
            ) : (
              user.initials
            )}
          </div>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-white/55">{user.email}</p>
            </div>
          ) : null}
        </Link>

        <LogoutButton
          redirectHref="/login"
          className={logoutClassName}
          title={collapsed ? "Logout" : undefined}
        >
          <DashboardIcon name="logout" className="h-5 w-5 shrink-0" />
          {!collapsed ? <span>Logout</span> : null}
        </LogoutButton>
      </div>
    </>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authProfile, setAuthProfile] = useState<AuthProfileResponse["data"] | null>(null);
  const desktopSidebarWidth = collapsed ? "lg:pl-[96px]" : "lg:pl-[276px]";
  const investeeDashboard = pathname.startsWith("/investee-dashboard");
  const fallbackSidebarUser = investeeDashboard ? investeeDashboardUser : dashboardUser;
  const sidebarUser: SidebarUser = {
    ...fallbackSidebarUser,
    email: authProfile?.email?.trim() || fallbackSidebarUser.email,
    initials: getInitials(authProfile?.name, fallbackSidebarUser.initials),
    name: authProfile?.name?.trim() || fallbackSidebarUser.name,
    profileImage: authProfile?.profileImage?.trim() || undefined,
  };
  const sidebarNavItems = investeeDashboard ? investeeDashboardNavItems : dashboardNavItems;
  const dashboardHomeHref = investeeDashboard ? "/investee-dashboard" : "/dashboard";
  const dashboardProfileHref = investeeDashboard ? "/investee-dashboard/profile" : "/dashboard/profile";
  const roleRedirectHref = getRoleDashboardHref(pathname, authProfile?.role);

  useEffect(() => {
    let active = true;
    const storedUser = getStoredAuthState()?.state?.user;

    if (storedUser) {
      setAuthProfile({
        email: storedUser.email,
        id: storedUser.id,
        name: storedUser.name,
        role: storedUser.role,
      });
    }

    const loadProfile = async () => {
      try {
        const response = await apiRequest<AuthProfileResponse>({
          method: "GET",
          url: "auth/profile",
        });

        if (active) {
          setAuthProfile(response.data ?? null);
        }
      } catch {
        if (active) {
          setAuthProfile(null);
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (roleRedirectHref) {
      router.replace(roleRedirectHref);
    }
  }, [roleRedirectHref, router]);

  if (roleRedirectHref) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm font-medium text-[#6B7280]">
        Loading dashboard...
      </div>
    );
  }

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
            profileHref={dashboardProfileHref}
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
                profileHref={dashboardProfileHref}
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
