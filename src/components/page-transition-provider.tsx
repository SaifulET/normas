"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getStoredAuthState } from "@/lib/auth-storage";

type TransitionState = "idle" | "leaving" | "entering";

function isDashboardPath(pathname: string) {
  return pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/investee-dashboard" ||
    pathname.startsWith("/investee-dashboard/");
}

function isSuperadminPath(pathname: string) {
  return pathname === "/superadmin" || pathname.startsWith("/superadmin/");
}

function shouldTransition(fromPath: string, toPath: string) {
  if (!fromPath || fromPath === toPath || isSuperadminPath(fromPath) || isSuperadminPath(toPath)) {
    return false;
  }

  return isDashboardPath(fromPath) !== isDashboardPath(toPath);
}

function getRoleCorrectedHref(href: string) {
  const storedRole = getStoredAuthState()?.state?.user?.role?.toLowerCase();

  if (storedRole === "investee" && (href === "/dashboard" || href.startsWith("/dashboard/"))) {
    return `/investee-dashboard${href.slice("/dashboard".length)}`;
  }

  if (storedRole === "investor" && (href === "/investee-dashboard" || href.startsWith("/investee-dashboard/"))) {
    return `/dashboard${href.slice("/investee-dashboard".length)}`;
  }

  return href;
}

export function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const previousPathRef = useRef(pathname);
  const stateRef = useRef<TransitionState>("idle");
  const timersRef = useRef<number[]>([]);
  const [transitionState, setTransitionState] = useState<TransitionState>("idle");

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const setState = (nextState: TransitionState) => {
    stateRef.current = nextState;
    setTransitionState(nextState);
  };

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
  };

  const navigateWithTransition = (href: string) => {
    if (stateRef.current !== "idle") {
      router.push(href);
      return;
    }

    clearTimers();
    setState("leaving");

    schedule(() => {
      router.push(href);
    }, 600);
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);

      if (nextUrl.origin !== window.location.origin || nextUrl.pathname === pathname) {
        return;
      }

      const correctedHref = getRoleCorrectedHref(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
      const correctedPathname = new URL(correctedHref, window.location.href).pathname;

      if (!shouldTransition(pathname, correctedPathname)) {
        return;
      }

      event.preventDefault();
      navigateWithTransition(correctedHref);
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, router]);

  useEffect(() => {
    const previousPath = previousPathRef.current;

    if (shouldTransition(previousPath, pathname)) {
      clearTimers();
      setState("entering");
      schedule(() => setState("idle"),600);
    }

    previousPathRef.current = pathname;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => clearTimers, []);

  return (
    <>
      <div className={transitionState === "idle" ? undefined : `page-transition-content page-transition-content-${transitionState}`}>
        {children}
      </div>

      {transitionState !== "idle" ? (
        <div className={`page-transition-overlay page-transition-overlay-${transitionState}`} aria-hidden="true">
          <div className="page-transition-base" />
          <div className="page-transition-panel page-transition-panel-primary" />
          <div className="page-transition-panel page-transition-panel-secondary" />
          <div className="page-transition-accent" />
        </div>
      ) : null}
    </>
  );
}
