"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { LinkItem } from "@/components/home/types";

function AuthSubmitButton({
  idleLabel,
  pendingLabel,
  variant,
}: {
  idleLabel: string;
  pendingLabel: string;
  variant: "primary" | "text";
}) {
  const { pending } = useFormStatus();

  if (variant === "primary") {
    return (
      <button
        type="submit"
        disabled={pending}
        className="hidden sm:inline-flex items-center justify-center rounded-full bg-[#E65E02] px-7 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#c84f00] disabled:cursor-wait disabled:opacity-80 whitespace-nowrap"
      >
        {pending ? pendingLabel : idleLabel}
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={pending}
      className="hidden uppercase tracking-[0.18em] text-[#2B425D] transition-colors duration-200 hover:text-[#E65E02] disabled:cursor-wait disabled:text-[#7A8697] sm:inline"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

export function NavbarAuthControls({
  authenticated,
  primaryCta,
  logoutAction,
}: {
  authenticated: boolean;
  primaryCta: LinkItem;
  logoutAction: () => Promise<void>;
}) {
  return authenticated ? (
    <>
      <Link
        className="hidden uppercase tracking-[0.18em] text-[#2B425D] transition-colors duration-200 hover:text-[#E65E02] sm:inline"
        href="/dashboard"
      >
        Dashboard
      </Link>
      <form action={logoutAction}>
        <AuthSubmitButton idleLabel="Logout" pendingLabel="Logging Out..." variant="primary" />
      </form>
    </>
  ) : (
    <>
      <Link
        className="hidden uppercase tracking-[0.18em] text-[#2B425D] transition-colors duration-200 hover:text-[#E65E02] sm:inline"
        href="/login"
      >
        Login
      </Link>
      <Link
        className="hidden sm:inline-flex rounded-full bg-[#E65E02] px-7 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#c84f00] whitespace-nowrap"
        href={primaryCta.href}
      >
        {primaryCta.label}
      </Link>
    </>
  );
}
