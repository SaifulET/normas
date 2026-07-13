"use client";

import { useState } from "react";
import Link from "next/link";
import type { LinkItem } from "@/components/home/types";

export function MobileNav({
  navItems,
  primaryCta,
  authenticated,
  logoutAction,
}: {
  navItems: LinkItem[];
  primaryCta: LinkItem;
  authenticated: boolean;
  logoutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2B425D]/5 text-[#2B425D] transition hover:bg-[#2B425D]/10"
        aria-label="Toggle mobile menu"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open ? (
        <div className="absolute left-4 right-4 top-[80px] z-[999] rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xl animate-in fade-in slide-in-from-top-5 duration-200">
          <nav className="flex flex-col gap-4 text-sm font-semibold uppercase tracking-wider text-[#182231]">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`py-2 border-b border-[#F1F5F9] last:border-0 ${item.active ? "text-[#E65E02]" : ""}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3 pt-2">
              {authenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex h-11 items-center justify-center rounded-full bg-[#2B425D]/5 text-sm font-semibold text-[#2B425D]"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      void logoutAction();
                    }}
                    className="flex h-11 items-center justify-center rounded-full bg-[#E65E02] text-sm font-semibold text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex h-11 items-center justify-center rounded-full bg-[#2B425D]/5 text-sm font-semibold text-[#2B425D]"
                  >
                    Login
                  </Link>
                  <Link
                    href={primaryCta.href}
                    onClick={() => setOpen(false)}
                    className="flex h-11 items-center justify-center rounded-full bg-[#E65E02] text-sm font-semibold text-white"
                  >
                    {primaryCta.label}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
